const Account = require("../model/account.model");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class VerifyEmailCheckDto {
    /**
     * @type {string}
     */
    email;

    /**
     * @type {string}
     */
    verificationCode;

    /**
     *
     * @param {{
     *  email: string,
     *  verificationCode: string
     * }} data
     */
    constructor(data) {
        this.email = data.email;
        this.verificationCode = data.verificationCode;
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
     *
     * @param {{
     *
     * }} body
     * @returns {VerifyEmailCheckDto}
     */
    static createDto(body) {
        VerifyEmailCheckDto.validate(body.email);
        return new VerifyEmailCheckDto({
            email: body.email,
            verificationCode: body.verificationCode,
        });
    }
}

module.exports = VerifyEmailCheckDto;
