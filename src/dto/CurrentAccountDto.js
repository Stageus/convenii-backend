class CurrentAccountDto {
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
     *@type {"false"|"true"|"expired"}
     */
    isLogin;
    /**
     *
     * @typedef {"false"|"true"|"expired"} LoginStatus
     *
     * @param {{
     *  idx: number;
     *  createdAt: Date;
     *  email: string;
     *  nickname: string;
     *  rankIdx: number;
     *  isLogin: "false"|"true"|"expired";
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.createdAt = data.createdAt;
        this.email = data.email;
        this.nickname = data.nickname;
        this.rankIdx = data.rankIdx;
        this.isLogin = data.isLogin;
    }

    validate() {}

    toDto() {}
}

module.exports = Account;
