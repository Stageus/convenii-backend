const router = require("express").Router();
const jwt = require("jsonwebtoken");
const redisClient = require("../modules/redisClient");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const patternConfig = require("../config/patternConfig");
const emailPattern = patternConfig.emailPattern;
const pwPattern = patternConfig.pwPattern;
const nicknamePattern = patternConfig.nicknamePattern;
const checkCondition = require("../middlewares/checkCondition");
const pgPool = require("../modules/pgPool");
const loginAuth = require("../middlewares/loginAuth");
const authenticateToken = require("../middlewares/authenticateToken");
const transporter = require("../modules/transporter");
const generateVerificationCode = require("../modules/generateVerificationCode")

// 토큰 발급도 모듈화 가능
// 이메일 인증번호 발급
// values 폴더 만들어서 patternConfig 안에 있는 거 옮기기 특정한 데이터들을... 아니면 벨리데이터에 전역변수로 넣기
// db 라는 폴더에 연결하는 함수 넣기
// 벨리데이터에서 전역변수를 o오브젝트로 지정하고, key만 보내기 checkCondition로 매개변수로 key를 받아서...


// 로그인, 비로그인 시 api 2개로 나누기!
router.post("/verify-email/send", authenticateToken, checkCondition("email", emailPattern), async (req, res, next) => {
    const { email } = req.body;
    try {
        if (!req.user) { // 회원가입시
            const emailSql = "SELECT email FROM account WHERE email = $1"; // deleted 된 건지 확인해야 함
            const emailQueryData = await pgPool.query(emailSql, [email]);

            if (emailQueryData.rows.length > 0) {
                const error = new Error("이메일이 중복됨");
                error.status = 400;
                throw error;
            }
        } else { // 비번 변경시
            if (req.user.email !== email) {
                const error = new Error("본인 이메일이 아님");
                error.status = 401;
                throw error;
            }
        }
        const verificationCode = generateVerificationCode();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "이메일 인증",
            text: `인증번호 : ${verificationCode}`
        }; // 매개변수로 보내줘도 돼 (이 전체를 모듈로)

        console.log(verificationCode);
        await transporter.sendMail(mailOptions); // 여기까지 모듈로

        await redisClient.hset('emailVerificationCodes', email, verificationCode, { "EX": 30 }); // 여기에 설정
        // await redisClient.expire('emailVerificationCodes:' + email, 30); // 초 설정

        res.status(201).send();
    } catch (error) {
        console.log(error);
        next(error);
    }
})

//이메일 인증확인
router.post("/verify-email/check", async (req, res, next) => {
    const { email, verificationCode } = req.body;
    try {
        const ttl = await redisClient.ttl('emailVerificationCodes:' + email);
        console.log(ttl); // 만료 시간이 되지도않는데 자꾸 -2가 나옴...
        const storedVerificationCode = await redisClient.hget('emailVerificationCodes', email);

        if (storedVerificationCode !== verificationCode) {
            const error = new Error("인증번호가 일치하지 않음");
            error.status = 401;
            throw error;
        }

        await redisClient.sadd('verifiedEmails', email);
        res.status(201).send();
    } catch (error) {
        next(error);
    }
})

//회원가입
//soft delete된 이메일, 닉네임 사용 가능하게 해야 함 ->
router.post("/", checkCondition("email", emailPattern), checkCondition("pw", pwPattern), checkCondition("nickname", nicknamePattern), async (req, res, next) => {
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
router.post("/login", checkCondition("email", emailPattern), checkCondition("pw", pwPattern), async (req, res, next) => {
    const { email, pw } = req.body;
    const result = {
        data: null
    }

    try {
        const trimEmail = email.trim();
        const sql = "SELECT * FROM account WHERE email =$1 AND password=$2 AND deleted_at IS NULL";
        const queryData = await pgPool.query(sql, [trimEmail, pw]);

        if (queryData.rows.length == 0) {
            const error = new Error("로그인 실패");
            error.status = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                "idx": queryData.rows[0].idx,
                "email": queryData.rows[0].email,
                "rank": queryData.rows[0].rank_idx,
            },
            process.env.SECRET_KEY,
            {
                "issuer": queryData.rows[0].nickname,
                "expiresIn": "10m" // 임시로 10분
            }
        ); // 얘도 모듈로 만들기

        result.data = { "accessToken": token }
        res.status(200).send(result)
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
router.put("/account/pw", loginAuth, checkCondition("pw", pwPattern), async (req, res, next) => {
    const { pw } = req.body;

})

module.exports = router