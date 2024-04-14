const jwt = require("jsonwebtoken");
const { UnauthorizedException } = require("../../util/module/Exception");

class AccountEntity {
    /**
     * @typedef {"false"|"true"|"expired"} LoginStatus
     */

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
     *@type {LoginStatus}
     */
    authStatus;
    /**
     *
     * @param {{
     *  idx: number;
     *  createdAt: Date;
     *  email: string;
     *  nickname: string;
     *  rankIdx: number;
     *  authStatus: LoginStatus;
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.createdAt = data.createdAt;
        this.email = data.email;
        this.nickname = data.nickname;
        this.rankIdx = data.rankIdx;
        this.authStatus = data.authStatus;
    }

    // validate() {
    //     if (!patternTest("idx", this.idx)) {
    //         throw new BadRequestException("idx error");
    //     }
    //     if (!patternTest("email", this.email)) {
    //         throw new BadRequestException("email error");
    //     }
    //     if (!patternTest("nickname", this.nickname)) {
    //         throw new BadRequestException("nickname error");
    //     }
    //     if (!patternTest("idx", this.rankIdx)) {
    //         throw new BadRequestException("rankIdx error");
    //     }
    // }

    /**
     *
     * @param {{
     *  idx: number,
     *  createdAt: Date,
     *  email: string,
     *  nickname: string,
     *  rankIdx: number
     * }} data
     *  @returns {void}
     */
    insertData(data) {
        this.idx = data.idx;
        this.createdAt = data.createdAt;
        this.email = data.email;
        this.nickname = data.nickname;
        this.rankIdx = data.rankIdx;
    }

    /**
     *
     * @param {string} token
     * @returns {void}
     */
    updateFromToken(token) {
        if (!token) {
            throw new UnauthorizedException("no token");
        }
        try {
            jwt.verify(token, process.env.SECRET_KEY);
            const payload = token.split(".")[1];
            const convert = Buffer.from(payload, "base64");
            const data = JSON.parse(convert.toString());
            this.insertData(data);
            this.authStatus = "true";
        } catch (err) {
            if (err.message !== "jwt expired") {
                throw new UnauthorizedException(err.message);
            }
            this.authStatus = "expired";
        }
    }
    /**
     *
     * @param {void} user
     * @returns {
     *  AccountEntity
     * }
     */
    static createEntity() {
        return new AccountEntity({
            idx: 1,
            createdAt: null,
            email: null,
            nickname: null,
            rankIdx: 0,
            authStatus: "false",
        });
    }
}

module.exports = AccountEntity;
