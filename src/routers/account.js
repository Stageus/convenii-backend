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
router.post(
    "/",
    checkCondition("email"),
    checkCondition("pw"),
    checkCondition("nickname"),
    wrapper(async (req, res, next) => {
        const { email, pw, nickname } = req.body;
        const emailData = query(
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
            throw BadRequestException("이메일이 중복됨");
        }

        const verified = await redisClient.get(`verifiedEmails:${email}`);

        if (!verified) {
            throw new ForbiddenException("인증되지 않은 이메일임");
        }

        const hashedPw = await bcrypt.hash(pw, 10);

        const nicknameData = await query(
            `
            SELECT
                nickname
            FROM
                account
            WHERE
                nickname = $1
            AND
                deleted_at IS NULL
            `,
            [nickname]
        );

        if (nicknameData.rows.length > 0) {
            throw BadRequestException("닉네임이 중복됨");
        }

        await query(
            `
            INSERT INTO account
                (email,password,nickname)
            VALUES
                ($1,$2,$3)
            `,
            [email, hashedPw, nickname]
        );

        res.status(201).send();
    })
);

//로그인
router.post(
    "/login",
    checkCondition("email"),
    checkCondition("pw"),
    wrapper(async (req, res, next) => {
        const { email, pw } = req.body;

        const trimEmail = email.trim();
        const userData = await query(
            `
            SELECT
                * 
            FROM 
                account
            WHERE 
                email =$1 
            AND 
                deleted_at IS NULL
              `,
            [trimEmail]
        );
        const user = userData.rows[0];

        const passwordMatch = await bcrypt.compare(pw, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException("로그인 실패");
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

        res.status(200).send({
            accessToken: accessToken,
        });
    })
);

//내 정보 보기
router.get(
    "/",
    loginAuth,
    wrapper(async (req, res, next) => {
        const user = req.user;

        const userData = await query(
            `
            SELECT
                *
            FROM
                account
            WHERE
                idx=$1
            `,
            [user.idx]
        );

        if (userData.rows.length === 0) {
            throw new NotFoundException("해당하는 계정이 없음");
        }

        res.status(200).send({
            idx: userData.rows[0].idx,
            email: userData.rows[0].email,
            nickname: userData.rows[0].nickname,
            created_at: userData.rows[0].created_at,
        });
    })
);

//회원 탈퇴하기
router.delete(
    "/",
    loginAuth,
    wrapper(async (req, res, next) => {
        const user = req.user;

        await pgPool.query(
            `
            UPDATE
                account
            SET
                deleted_at = NOW()
            WHERE
                idx = $1
            `,
            [user.idx]
        );

        res.status(201).send();
    })
);
/// 비로그인 상태에서 비밀번호 변경하기
router.put(
    "/pw",
    checkCondition("pw"),
    wrapper(async (req, res, next) => {
        const { email, pw } = req.body;

        const verified = await redisClient.get(`verifiedEmails:${email}`);

        if (!verified) {
            throw new ForbiddenException("인증되지 않은 이메일임");
        }

        const hashedPw = await bcrypt.hash(pw, 10);
        await query(
            `
            UPDATE
                account
            SET
                password=$1
            WHERE
                idx=$2
            `,
            [hashedPw, user.idx]
        );

        res.status(201).send();
    })
);

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
