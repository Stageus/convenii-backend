const Account = require("./Account");

class Review {
    /**
     * @type {Account}
     */
    account;

    /**
     * @type {number}
     */
    productIdx;

    /**
     * @type {string}
     */
    content;

    /**
     * @type {number}
     */
    score;

    /**
     * @type {Date}
     */
    createdAt;

    /**
     *
     * @param {{
     *  account: Account;
     *  productIdx: number;
     *  content: string;
     *  score: number;
     *  createdAt: Date;
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.productIdx = data.productIdx;
        this.content = data.content;
        this.score = data.score;
        this.createdAt = data.createdAt;
    }
}

module.exports = Review;
