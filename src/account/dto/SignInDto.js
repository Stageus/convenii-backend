const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");
class SignInDto {
    /**
     * @type {string}
     */
    email;

    /**
     * @type {string}
     */
    pw;

    /**
     *
     * @param {{
     *  email:string,
     *  pw:string
     * }} data
     */
    constructor(data) {
        this.email = data.email;
        this.pw = data.pw;
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
     *
     * @param {{
     *  email: string,
     *  pw: string
     * }} body
     * @returns {Promise<SignInDto>}
     */
    static async createDto(body) {
        SignInDto.validate(body);
        return await SignInDto({
            email: body.email.trim(),
            pw: hashedPw,
        });
    }
}

module.exports = SignInDto;
