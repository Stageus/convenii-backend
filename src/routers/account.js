const router = require("express").Router();
const jwt = require("jsonwebtoken");
const redis = require("redis").createClient();
const uuid = require("uuid");

const patternConfig = require("../config/patternConfig");
const emailPattern = patternConfig.emailPattern;
const pwPattern = patternConfig.pwPattern;
const nicknamePattern = patternConfig.nicknamePattern;
const checkCondition = require("../middlewares/checkCondition");
const pgPool = require("../modules/pgPool");
const loginAuth = require("../middlewares/loginAuth");

//이메일 인증번호 발급
router.post("/account/verify-email/send", loginAuth, async (req, res, next) => {

})

//이메일 인증확인
router.post("/account/verify-email/check", async (req, res, next) => {

})

//회원가입
router.post("/", checkCondition("email", emailPattern), checkCondition("pw", pwPattern), checkCondition("nickname", nicknamePattern), async (req, res, next) => {
    const { email, pw, nickname } = req.body;

    try { // 인증된 email인지 아닌지 확인하는 법을 모르겠어요 ㅠ, rank_idx 입력 받아야 하지 않나요?? pwSame 입력 받아야 해요!
        const nicknameSql = "SELECT nickname FROM account WHERE nickname = $1"; // deleted 된 건지 확인해야 함
        const nicknameQueryData = await pgPool.query(nicknameSql, [nickname]);
        const rank = 1; // 일시적으로 넣어놓음 rank

        if (nicknameQueryData.rows.length > 0) {
            const error = new Error("닉네임이 중복됨");
            error.status = 400;
            throw error;
        }

        const insertSql = "INSERT INTO account (email,password,nickname,rank_idx) VALUES ($1,$2,$3,$4)";
        await pgPool.query(insertSql, [email, pw, nickname, rank]);

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
        const sql = "SELECT * FROM account WHERE email =$1 AND password=$2";
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
        );

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

        if (queryData.length === 0) {
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }

        result.data = {
            "idx": queryData[0].idx,
            "email": queryData[0].email,
            "pw": queryData[0].password,
            "nickname": queryData[0].nickname,
            "created_at": queryData[0].created_at
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
router.put("/account/pw", loginAuth, checkCondition("pw", pwPattern), async (req, res, next) => {
    const { pw } = req.body;

})

module.exports = router