const accountAuth = require("../util/middleware/accountAuth");
const wrapper = require("../util/module/wrapper");
const { verifyEmailSend, verifyEmailCheck, signIn, signUp, withdrawAccount, changePassword } = require("./account.service");
const ChangePasswordDto = require("./dto/ChangePasswordDto");
const SignInDto = require("./dto/SignInDto");
const SignUpDto = require("./dto/SignUpDto");
const VerifyEmailCheckDto = require("./dto/VerifyEmailCheckDto");
const VerifyEmailSendDto = require("./dto/VerifyEmailSendDto");
const SignInResponseDto = require("./dto/responseDto/SignInResponseDto");
const GetAccountResponseDto = require("./dto/responseDto/getAccountResponseDto");

const router = require("express").Router();

//인증번호 발급,
//비밀번호 변경 api가 각각 로그인, 비로그인으로 나누어져 있는데
//합칠 수 있음

//이메일 인증번호 발급 (비로그인 상태시)
router.post(
    "/verify-email/send",
    accountAuth(),
    wrapper(async (req, res, next) => {
        await verifyEmailSend(VerifyEmailSendDto.createDto(req.user, req.body));
        res.status(201).send();
    })
);

//이메일 인증번호 발급 (로그인 상태시)
router.post(
    "/verify-email/send/login",
    accountAuth(1),
    wrapper(async (req, res, next) => {
        await verifyEmailSend(VerifyEmailSendDto.createDto(req.user, req.body));
        res.status(201).send();
    })
);

//이메일 인증확인
router.post(
    "/verify-email/check",
    wrapper(async (req, res, next) => {
        await verifyEmailCheck(VerifyEmailCheckDto.createDto(req.body));
        res.status(201).send();
    })
);

//회원가입
router.post(
    "/",
    wrapper(async (req, res, next) => {
        await signUp(await SignUpDto.createDto(req.body));
        res.status(201).send();
    })
);

//로그인
router.post(
    "/login",
    wrapper(async (req, res, next) => {
        const token = await signIn(await SignInDto.createDto(req.body));
        res.status(200).send(SignInResponseDto.createDto(token));
    })
);

//내 정보 보기
router.get(
    "/",
    accountAuth(1),
    wrapper(async (req, res, next) => {
        res.status(200).send(GetAccountResponseDto.create(req.user));
    })
);

//회원 탈퇴하기
router.delete(
    "/",
    accountAuth(1),
    wrapper(async (req, res, next) => {
        await withdrawAccount(req.user);
        res.status(201).send();
    })
);
// 비로그인 상태에서 비밀번호 변경하기
router.put(
    "/pw",
    accountAuth(),
    wrapper(async (req, res, next) => {
        await changePassword(ChangePasswordDto.createDto(req.user, req.body));
        res.status(201).send();
    })
);

// 로그인 상태에서 비밀번호 변경하기
router.put(
    "/pw/login",
    accountAuth(1),
    wrapper(async (req, res, next) => {
        await changePassword(ChangePasswordDto.createDto(req.user, req.body));
        res.status(201).send();
        res.status(201).send();
    })
);
module.exports = router;
