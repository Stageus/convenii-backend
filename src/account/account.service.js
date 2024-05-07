const { NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } = require("../util/module/Exception");
const generateVerificationCode = require("../util/module/generateVerificationCode");
const sendVerificationEmail = require("../util/module/sendVerificationEmail");
const { selectAccountByEmail, selectAccountByNickname, insertAccount, deleteAccount, updateAccount } = require("./account.repository");
const ChangePasswordDto = require("./dto/ChangePasswordDto");
const CheckLoginDto = require("./dto/CheckLoginDto");
const SignInDto = require("./dto/SignInDto");
const SignUpDto = require("./dto/SignUpDto");
const VerifyEmailCheckDto = require("./dto/VerifyEmailCheckDto");
const VerifyEmailSendDto = require("./dto/VerifyEmailSendDto");
const TokenEntity = require("./entity/TokenEntity");
const AccountEntity = require("./entity/AccountEntity");
const { setEmailWithCode, getEmailVerification, setEmailVerified, checkEmailVerification } = require("./redis.repository");
const bcrypt = require("bcrypt");

/**
 *
 * @param {CheckLoginDto} checkLoginDto
 * @returns {Promise<AccountEntity>}
 */
const checkLogin = async (checkLoginDto) => {
    const { token, needRank } = checkLoginDto;
    const user = AccountEntity.createEntity();
    user.updateFromToken(token);
    user.checkPermission(needRank);
    return user;
};

/**
 *
 * @param {VerifyEmailSendDto} verifyEmailSendDto
 * @returns {Promise<void>}
 */
const verifyEmailSend = async (verifyEmailSendDto, mode = "signUp") => {
    const { email, account } = verifyEmailSendDto;

    if (account === "noLogin") {
        const alreadyHaveUser = await selectAccountByEmail({ email: email });
        if (alreadyHaveUser && mode === "signUp") {
            throw new UnauthorizedException("already have email");
        } else if (!alreadyHaveUser && mode === "recovery") {
            throw new UnauthorizedException("no email");
        }
    }
    const verificationCode = generateVerificationCode();

    await sendVerificationEmail(email, verificationCode);
    await setEmailWithCode({
        email: email,
        verificationCode: verificationCode,
    });
};

/**
 *
 * @param {VerifyEmailCheckDto} verifyEmailCheckDto
 * @returns {Promise<void>}
 */
const verifyEmailCheck = async (verifyEmailCheckDto) => {
    const storedVerificationCode = await getEmailVerification(verifyEmailCheckDto);
    if (storedVerificationCode !== verifyEmailCheckDto.verificationCode) {
        throw new UnauthorizedException("not match verificationCode");
    }
    await setEmailVerified(verifyEmailCheckDto);
};

/**
 *
 * @param {SignUpDto} signUpDto
 * @returns {Promise<TokenEntity>}
 */
const signUp = async (signUpDto) => {
    const accountCheck = await selectAccountByEmail(signUpDto);
    if (accountCheck) {
        throw new BadRequestException("email duplicate");
    }
    const verified = await checkEmailVerification(signUpDto);
    if (!verified) {
        throw new ForbiddenException("not verified email");
    }

    const nicknameCheck = await selectAccountByNickname(signUpDto);

    if (nicknameCheck) {
        throw new BadRequestException("nickname duplicate");
    }
    const account = await insertAccount(signUpDto);
    return TokenEntity.createEntity(account);
};

/**
 *
 * @param {SignInDto} signInDto
 * @returns {Promise<TokenEntity>}
 */
const signIn = async (signInDto) => {
    const account = await selectAccountByEmail(signInDto);
    if (!account) {
        throw new UnauthorizedException("login fail");
    }

    const passwordMatch = await bcrypt.compare(signInDto.pw, account.password);
    if (!passwordMatch) {
        throw new UnauthorizedException("login fail");
    }

    return TokenEntity.createEntity(account);
};

/**
 *
 * @param {AccountEntity} accountEntity
 * @returns {AccountEntity}
 */
const getAccount = async (accountEntity) => {
    return accountEntity;
};

/**
 *
 * @param {AccountEntity} accountEntity
 * @returns {Promise<void>}
 */
const withdrawAccount = async (accountEntity) => {
    await deleteAccount(accountEntity);
};

/**
 *
 * @param {ChangePasswordDto} changePasswordDto
 * @returns {Promise<void>}
 */
const changePassword = async (changePasswordDto) => {
    const verified = await checkEmailVerification(changePasswordDto);
    if (!verified) {
        throw new ForbiddenException("not verified email");
    }
    await updateAccount(changePasswordDto);
};
module.exports = {
    checkLogin,
    verifyEmailSend,
    verifyEmailCheck,
    signUp,
    signIn,
    getAccount,
    withdrawAccount,
    changePassword,
};
