const router = require("express").Router();
const redisClient = require("../modules/redisClient");
const bcrypt = require("bcrypt");

const checkCondition = require("../middlewares/checkCondition");
const pgPool = require("../modules/pgPool");
const loginAuth = require("../middlewares/loginAuth");
const sendVerificationEmail = require("../modules/sendVerificationEmail");
const generateVerificationCode = require("../modules/generateVerificationCode");
const issueToken = require("../modules/issueToken");
const wrapper = require("../modules/wrapper");
const query = require("../modules/query");
const { Exception, NotFoundException, BadRequestException, ForbiddenException } = require("../modules/Exception");

//이메일 인증번호 발급 (비로그인 상태시)
router.post(
    "/verify-email/send",
    checkCondition("email"),
    wrapper(async (req, res, next) => {
        const { email } = req.body;

        const emailData = await query(
            `
            SELECT
                email
            FROM
                account
            WHERE
                email = $1
             AND
                deleted_at IS NULL
            `,
            [email]
        );

        if (emailData.rows.length > 0) {
            throw new BadRequestException("이메일이 중복됨");
        }
        const verificationCode = generateVerificationCode();

        await sendVerificationEmail(email, verificationCode);

        await redisClient.set(`emailVerification:${email}`, verificationCode, "EX", 180);
        res.status(201).send();
    })
);

//이메일 인증번호 발급 (로그인 상태시)
router.post(
    "/verify-email/send/login",
    loginAuth,
    checkCondition("email"),
    wrapper(async (req, res, next) => {
        const { email } = req.body;

        if (req.user.email !== email) {
            throw new UnauthorizedException("본인 이메일이 아님");
        }

        const verificationCode = generateVerificationCode();
        await sendVerificationEmail(email, verificationCode);
        await redisClient.set(`emailVerification:${email}`, verificationCode, "EX", 180);
        res.status(201).send();
    })
);

//이메일 인증확인
router.post(
    "/verify-email/check",
    wrapper(async (req, res, next) => {
        const { email, verificationCode } = req.body;

        const storedVerificationCode = await redisClient.get(`emailVerification:${email}`);

        if (storedVerificationCode !== verificationCode) {
            throw new UnauthorizedException("인증번호가 일치하지 않음");
        }

        await redisClient.set(`verifiedEmails:${email}`, "verified", "EX", 1800);
        res.status(201).send();
    })
);

//회원가입
router.post("/", checkCondition("email"), checkCondition("pw"), checkCondition("nickname"), async (req, res, next) => {
    const { email, pw, nickname } = req.body;

    try {
        const emailSql = "SELECT email FROM account WHERE email = $1 AND deleted_at IS NULL";
        const emailQueryData = await pgPool.query(emailSql, [email]);

        if (emailQueryData.rows.length > 0) {
            const error = new Error("이메일이 중복됨");
            error.status = 400;
            throw error;
        }

        const verified = await redisClient.get(`verifiedEmails:${email}`);

        if (!verified) {
            const error = new Error("인증되지 않은 이메일임");
            error.status = 403;
            throw error;
        }

        const hashedPw = await bcrypt.hash(pw, 10);

        const nicknameSql = "SELECT nickname FROM account WHERE nickname = $1 AND deleted_at IS NULL";
        const nicknameQueryData = await pgPool.query(nicknameSql, [nickname]);

        if (nicknameQueryData.rows.length > 0) {
            const error = new Error("닉네임이 중복됨");
            error.status = 400;
            throw error;
        }

        const insertSql = "INSERT INTO account (email,password,nickname) VALUES ($1,$2,$3)";
        await pgPool.query(insertSql, [email, hashedPw, nickname]);

        res.status(201).send();
    } catch (error) {
        next(error);
    }
});

//로그인
router.post("/login", checkCondition("email"), checkCondition("pw"), async (req, res, next) => {
    const { email, pw } = req.body;
    const result = {
        data: null,
    };

    try {
        const trimEmail = email.trim();
        const sql = "SELECT * FROM account WHERE email =$1 AND deleted_at IS NULL";
        const queryData = await pgPool.query(sql, [trimEmail]);
        const user = queryData.rows[0];

        const passwordMatch = await bcrypt.compare(pw, user.password);
        if (!passwordMatch) {
            const error = new Error("로그인 실패");
            error.status = 401;
            throw error;
        }

        const tokenPayload = {
            idx: user.idx,
            email: user.email,
            rank: user.rank_idx,
        };

        const tokenOptions = {
            issuer: user.nickname,
            expiresIn: "10m", // 임시로 10분
        };

        const accessToken = issueToken(tokenPayload, tokenOptions);

        result.data = { accessToken: accessToken };
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

//내 정보 보기
router.get("/", loginAuth, async (req, res, next) => {
    const idx = req.user.idx;
    const result = {
        data: null,
    };
    try {
        const sql = "SELECT * FROM account WHERE idx=$1";
        const queryData = await pgPool.query(sql, [idx]);

        if (queryData.rows.length === 0) {
            const error = new Error("해당하는 계정이 없음");
            error.status = 404;
            throw error;
        }

        result.data = {
            idx: queryData.rows[0].idx,
            email: queryData.rows[0].email,
            nickname: queryData.rows[0].nickname,
            created_at: queryData.rows[0].created_at,
        };
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

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
});

/// 비로그인 상태에서 비밀번호 변경하기
router.put("/pw", checkCondition("pw"), async (req, res, next) => {
    const { email, pw } = req.body;
    try {
        const verified = await redisClient.get(`verifiedEmails:${email}`);

        if (!verified) {
            const error = new Error("인증되지 않은 이메일임");
            error.status = 403;
            throw error;
        }

        const hashedPw = await bcrypt.hash(pw, 10);
        const sql = "UPDATE account SET password=$1 WHERE idx=$2";
        await pgPool.query(sql, [hashedPw, user.idx]);

        res.status(201).send();
    } catch (error) {
        next(error);
    }
});

// 로그인 상태에서 비밀번호 변경하기
router.put("/pw/login", loginAuth, checkCondition("pw"), async (req, res, next) => {
    const { email, pw } = req.body;
    try {
        const user = req.user;
        if (user.email !== email) {
            const error = new Error("본인 이메일이 아님");
            error.status = 401;
            throw error;
        }

        const verified = await redisClient.get(`verifiedEmails:${email}`);

        if (!verified) {
            const error = new Error("인증되지 않은 이메일임");
            error.status = 403;
            throw error;
        }

        const hashedPw = await bcrypt.hash(pw, 10);
        const sql = "UPDATE account SET password=$1 WHERE idx=$2";
        await pgPool.query(sql, [hashedPw, user.idx]);

        res.status(201).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
