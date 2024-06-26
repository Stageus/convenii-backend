const Account = require("../model/account.model");
const bcrypt = require("bcrypt");
const { BadRequestException, UnauthorizedException, ForbiddenException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class ChangePasswordDto {
    /**
     * @type {Account}
     */
    account;
    /**
     * @type {string}
     */
    email;

    /**
     * @type {string}
     */
    hashedPw;

    /**
     *
     * @param {{
     *  account: Account,
     *  email: string
     *  hashedPw: string
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.email = data.email;
        this.hashedPw = data.hashedPw;
    }
    /**
     *
     * @param {{
     *  email:string,
     *  pw: string
     * }} body
     * @throws {BadRequestException}
     */
    static validate(body) {
        if (!patternTest("email", body.email)) {
            throw new BadRequestException("email error");
        }
        if (!patternTest("pw", body.pw)) {
            throw new BadRequestException("pw error");
        }
    }

    /**
     * @param {Account} user
     * @param {{
     *  email: string
     *  pw: string
     * }} body
     * @returns {Promise<ChangePasswordDto>}
     */
    static async createDto(user, body) {
        ChangePasswordDto.validate(body);
        if (user.authStatus === "true") {
            if (user.email !== body.email) {
                throw new ForbiddenException("email 과 token이 일치하지 않음");
            }
        }
        const hashedPw = await bcrypt.hash(body.pw, 10);
        return new ChangePasswordDto({
            account: user.authStatus === "true" ? user : "noLogin",
            email: body.email,
            hashedPw: hashedPw,
        });
    }
}
module.exports = ChangePasswordDto;
