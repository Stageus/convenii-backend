const router = require("express").Router();
const jwt = require("jsonwebtoken");
const redisClient = require("../modules/redisClient");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const checkCondition = require("../middlewares/checkCondition");
const pgPool = require("../modules/pgPool");
const loginAuth = require("../middlewares/loginAuth");
const sendVerificationEmail = require("../modules/sendVerificationEmail");
const generateVerificationCode = require("../modules/generateVerificationCode");
const issueToken = require("../modules/issueToken");

// 이메일 인증번호 발급
// values 폴더 만들어서 patternConfig 안에 있는 거 옮기기 특정한 데이터들을... 아니면 벨리데이터에 전역변수로 넣기
// db 라는 폴더에 연결하는 함수 넣기

// 로그인, 비로그인 시 api 2개로 나누기!

//이메일 인증번호 발급 (비로그인 상태시)
router.post("/verify-email/send", checkCondition("email"), async (req, res, next) => {
    const { email } = req.body;
    try {
        const emailSql = "SELECT email FROM account WHERE email = $1 AND deleted_at IS NULL"; // deleted 된 건지 확인해야 함
        const emailQueryData = await pgPool.query(emailSql, [email]);

        if (emailQueryData.rows.length > 0) {
            const error = new Error("이메일이 중복됨");
            error.status = 400;
            throw error;
        }
        const verificationCode = generateVerificationCode();

        await sendVerificationEmail(email, verificationCode);

        await redisClient.set(`emailVerification:${email}`, verificationCode, "EX", 180);
        res.status(201).send();
    } catch (error) {
        console.log(error);
        next(error);
    }
});

//이메일 인증번호 발급 (로그인 상태시)
router.post("/verify-email/send/login", loginAuth, checkCondition("email"), async (req, res, next) => {
    const { email } = req.body;
    try {
        if (req.user.email !== email) {
            const error = new Error("본인 이메일이 아님");
            error.status = 401;
            throw error;
        }

        const verificationCode = generateVerificationCode();

        await sendVerificationEmail(email, verificationCode);

        await redisClient.set(`emailVerification:${email}`, verificationCode, "EX", 180);
        res.status(201).send();
    } catch (error) {
        console.log(error);
        next(error);
    }
});

//이메일 인증확인
router.post("/verify-email/check", async (req, res, next) => {
    const { email, verificationCode } = req.body;
    try {
        const storedVerificationCode = await redisClient.get(`emailVerification:${email}`);

        if (storedVerificationCode !== verificationCode) {
            const error = new Error("인증번호가 일치하지 않음");
            error.status = 401;
            throw error;
        }

        await redisClient.sadd("verifiedEmails", email);
        res.status(201).send();
    } catch (error) {
        next(error);
    }
});

//회원가입
//soft delete된 이메일, 닉네임 사용 가능하게 해야 함 ->
router.post("/", checkCondition("email"), checkCondition("pw"), checkCondition("nickname"), async (req, res, next) => {
    const { email, pw, nickname } = req.body;

    try {
        const hashedPw = await bcrypt.hash(pw, 10);

        const nicknameSql = "SELECT nickname FROM account WHERE nickname = $1 AND deleted_at IS NULL";
        const nicknameQueryData = await pgPool.query(nicknameSql, [nickname]);

        const rank = 1;

        if (nicknameQueryData.rows.length > 0) {
            const error = new Error("닉네임이 중복됨");
            error.status = 400;
            throw error;
        }

        console.log("뇽")
        const insertSql = "INSERT INTO account (email,password,nickname,rank_idx) VALUES ($1,$2,$3,$4)";
        await pgPool.query(insertSql, [email, hashedPw, nickname, rank]);

        console.log("sbd")

        res.status(201).send();
    } catch (error) {
        next(error);
    }
})

//로그인
router.post("/login", checkCondition("email"), checkCondition("pw"), async (req, res, next) => {
    const { email, pw } = req.body;
    const result = {
        data: null
    }

    try {
        const trimEmail = email.trim();
        const sql = "SELECT * FROM account WHERE email =$1 AND deleted_at IS NULL";
        const queryData = await pgPool.query(sql, [trimEmail]);
        const user = queryData.rows[0];

        if (queryData.rows.length == 0) {
            const error = new Error("로그인 실패");
            error.status = 401;
            throw error;
        }

        const passwordMatch = await bcrypt.compare(pw, user.password);
        if (!passwordMatch) {
            const error = new Error("로그인 실패");
            error.status = 401;
            throw error;
        }

        const tokenPayload = {
            "idx": user.idx,
            "email": user.email,
            "rank": user.rank_idx
        };

        const tokenOptions = {
            "issuer": user.nickname,
            "expiresIn": "10m" // 임시로 10분
        }

        const accessToken = issueToken(tokenPayload, tokenOptions);

        result.data = { "accessToken": accessToken };
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
})

//내 정보 보기 
router.get("/", loginAuth, async (req, res, next) => {
    const idx = req.user.idx
    const result = {
        "data": null
    }
    try {
        const sql = "SELECT * FROM account WHERE idx=$1"
        const queryData = await pgPool.query(sql, [idx])

        if (queryData.rows.length === 0) {
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }

        result.data = {
            "idx": queryData.rows[0].idx,
            "email": queryData.rows[0].email,
            "pw": queryData.rows[0].password,
            "nickname": queryData.rows[0].nickname,
            "created_at": queryData.rows[0].created_at
        }
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//회원 탈퇴하기
router.delete("/", loginAuth, async (req, res, next) => {
    const idx = req.user.idx;
    try {
        const sql = "UPDATE account SET deleted_at = NOW() WHERE idx = $1";
        await pgPool.query(sql, [idx]);

        //토큰 삭제 필요..?
        res.status(201).send();
    } catch (error) {
        next(error);
    }
})

//비밀번호 변경하기 -> 1. 로그인 전 비밀번호 찾기(이땐 email이 body로 필요하지 않나요??), 2. 내 정보 수정에서 비밀번호 변경 --> (토큰이 존재할 경우)가 없어야 하지 않나용? 아님 case를 나눠서...
//-> 로그인 전 비밀번호 변경은 token에 정보가 없으니까 email이 꼭 필요하지 않을까용?
// -> 인증되면 redis에 email 넣기 + 입력으로 email 받기
// -> loginAuth 없이도 토큰 정보 얻을 수 있는 미들웨어 생각해보기

//2개로 나누기 (식별값도 넣기)
router.put("/account/pw", loginAuth, checkCondition("pw"), async (req, res, next) => {
    const { pw } = req.body;

})

module.exports = router