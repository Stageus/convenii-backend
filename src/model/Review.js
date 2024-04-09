const Account = require("./Account");

class Review {
    /**
     * @type {Account}
     */
    account;

    /**
     * @type {productIdx}
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
     *
     * @param {{
     *  account: Account;
     *  productIdx: number;
     *  content: string;
     *  score: number;
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.productIdx = data.productIdx;
        this.content = data.content;
        this.score = data.score;
    }
}

module.exports = Review;
