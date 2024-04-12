const { BadRequestException } = require("../modules/Exception");
const patternTest = require("../modules/patternTest");

class CreateAccountDto {
    /**
     * @type {number}
     */
    idx;

    /**
     * @type {Date}
     */
    createdAt;

    /**
     * @type {string}
     */
    email;

    /**
     * @type {string}
     */
    nickname;

    /**
     * @type {number}
     */
    rankIdx;

    /**
     *
     * @param {{
     *  idx: number;
     *  createdAt: Date;
     *  email: string;
     *  nickname: string;
     *  rankIdx; number;
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.createdAt = data.createdAt;
        this.email = data.email;
        this.nickname = data.nickname;
        this.rankIdx = data.rankIdx;
    }

    validate() {
        if (!patternTest("idx", this.idx)) {
            throw new BadRequestException("idx error");
        }
        if (!patternTest("email", this.email)) {
            throw new BadRequestException("email error");
        }
        if (!patternTest("nickname", this.nickname)) {
            throw new BadRequestException("nickname error");
        }
        if (!patternTest("idx", this.rankIdx)) {
            throw new BadRequestException("rankIdx error");
        }
    }

    createAccount() {
        this.validate();
        return new Account({
            idx: this.idx,
            createdAt: this.createdAt,
            email: this.email,
            nickname: this.nickname,
            rankIdx: this.rankIdx,
        });
    }
}

module.exports = CreateAccountDto;
