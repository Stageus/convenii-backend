const Account = require("../model/account.model");
const { BadRequestException, UnauthorizedException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class VerifyEmailSendDto {
    /**
     * @type {Account}
     */
    account;

    /**
     * @type {string}
     */
    email;

    /**
     *
     * @param {{
     *  account: Account,
     *  email: string
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.email = data.email;
    }

    /**
     *
     * @param {string} email
     * @throws {BadRequestException}
     */
    static validate(email) {
        if (!patternTest("email", email)) {
            throw new BadRequestException("email error");
        }
    }
    /**
     * @param {Account} user
     * @param {{
     *  email: string
     * }} body
     * @returns {VerifyEmailSendDto}
     */
    static createDto(user, body) {
        VerifyEmailSendDto.validate(body.email);
        if (user.authStatus === "true") {
            if (user.email !== body.email) {
                throw new UnauthorizedException("email error");
            }
        }
        return new VerifyEmailSendDto({
            account: user.authStatus === "true" ? user : "noLogin",
            email: body.email,
        });
    }
}

module.exports = VerifyEmailSendDto;
