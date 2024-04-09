class Account {
    /**
     * @type {number}
     */
    idx;

    /**
     * @type {string}
     */
    name;

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
     *  name: string;
     *  createdAt: Date;
     *  email: string;
     *  nickname: string;
     *  rankIdx; number;
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.name = data.name;
        this.createdAt = data.createdAt;
        this.email = data.email;
        this.nickname = data.nickname;
        this.rankIdx = data.rankIdx;
    }
}

module.exports = Account;
