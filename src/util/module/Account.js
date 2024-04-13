class Account {
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

    /**
     * @param {
     *  idx: number;
     *  createdAt: Date;
     *  email: string;
     *  nickname: string;
     *  rankIdx: number;
     *  authStatus: LoginStatus;
     * }
     * @returns {void}
     */
    getLoginStatus(data) {
        this.idx = data.idx;
        this.createdAt = data.createdAt;
        this.email = data.email;
        this.nickname = data.nickname;
        this.rankIdx = data.rankIdx;
        this.authStatus = "true";
    }

    isExpired() {
        this.authStatus = "expired";
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

    /**
     *
     * @param {{
     *  idx:number,
     *  createdAt: Date,
     *  email: string,
     *  nickname: string,
     *  rankIdx: number,
     *  authStatus: LoginStatus
     * }} user
     * @returns {
     *  Account
     * }
     */
    static createAccount() {
        return new Account({
            idx: 0,
            createdAt: null,
            email: null,
            nickname: null,
            rankIdx: null,
            authStatus: "false",
        });
    }
}

module.exports = Account;
