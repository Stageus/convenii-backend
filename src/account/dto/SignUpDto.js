const bcrypt = require("bcrypt");
const patternTest = require("../../util/module/patternTest");
const { BadRequestException } = require("../../util/module/Exception");

class SignUpDto {
    /**
     * @type {string}
     */
    email;

    /**
     * @type {string}
     */
    hashedPw;

    /**
     * @type {string}
     */
    nickname;

    /**
     *
     * @param {{
     *  email: string,
     *  hashedPw: string,
     *  nickname: string
     * }} data
     */
    constructor(data) {
        this.email = data.email;
        this.hashedPw = data.hashedPw;
        this.nickname = data.nickname;
    }

    /**
     *
     * @param {{
     *  email: string,
     *  pw: string,
     *  nickname: string
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
        if (!patternTest("nickname", body.nickname)) {
            throw new BadRequestException("nickname error");
        }
    }

    /**
     *
     * @param {
     *  email: string,
     *  pw: string,
     *  nickname: string
     * } body
     * @returns {Promise<SignUpDto>}
     */
    static async createDto(body) {
        SignUpDto.validate(body);
        const hashedPw = await bcrypt.hash(body.pw, 10);
        return await new SignUpDto({
            email: body.email,
            hashedPw: hashedPw,
            nickname: body.nickname,
        });
    }
}

module.exports = SignUpDto;
