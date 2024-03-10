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

router.post("/", checkCondition("email", emailPattern), checkCondition("pw", pwPattern), checkCondition("nickname", nicknamePattern), checkSame("pw", "pwSame"), async (req, res, next) => {
    const { email, pw, nickname } = req.body;
    try { // 인증된 email인지 아닌지 확인하는 법을 모르겠어요 ㅠ 
        const nicknameSql = "SELECT nickname FROM account WHERE nickname = $1";
        const nicknameQueryData = await queryModule(nicknameSql, [nickname]);

        if (nicknameQueryData.length > 0) {
            const error = new Error("닉네임이 중복됨");
            error.status = 400;
            throw error;
        }

        const insertSql = "INSERT INTO account (email,pw,nickname) VALUES ($1,$2,$3)";
        await queryModule(insertSql, [email, pw, nickname]);

        res.sendStatus(201);
    } catch (error) {
        next(error);
    }
})