const router = require("express").Router();
const jwt = require("jsonwebtoken");
const redis = require("redis").createClient();
const uuid = require("uuid");

const patternConfig = require("../config/patternConfig");
const emailPattern = patternConfig.emailPattern;
const pwPattern = patternConfig.pwPattern;
const nicknamePattern = patternConfig.nicknamePattern;
const checkCondition = require("../middleware/checkCondition");
const checkSame = require("../middleware/checkSame");
const queryModule = require("../modules/queryModule");

//회원가입
router.post("/", checkCondition("email", emailPattern), checkCondition("pw", pwPattern), checkCondition("nickname", nicknamePattern), checkSame("pw", "pwSame"), async (req, res, next) => {
    const { email, pw, nickname } = req.body;
    console.log(email)

    try { // 인증된 email인지 아닌지 확인하는 법을 모르겠어요 ㅠ, rank_idx 입력 받아야 하지 않나요?? pwSame 입력 받아야 해요!
        const nicknameSql = "SELECT nickname FROM account WHERE nickname = $1";
        const nicknameQueryData = await queryModule(nicknameSql, [nickname]);
        const rank = 2; // 일시적으로 넣어놓음 rank

        if (nicknameQueryData.length > 0) {
            const error = new Error("닉네임이 중복됨");
            error.status = 400;
            throw error;
        }

        const insertSql = "INSERT INTO account (email,password,nickname,rank_idx) VALUES ($1,$2,$3,$4)";
        await queryModule(insertSql, [email, pw, nickname, rank]);

        res.sendStatus(201);
    } catch (error) {
        next(error);
    }
})

//로그인
router.post("/login", checkCondition("email", emailPattern), checkCondition("pw", pwPattern), async (req, res, next) => {
    const { email, pw } = req.body;
})

module.exports = router