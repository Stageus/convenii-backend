const Account = require("../entity/Account");
const Review = require("../entity/Review");
const { BadRequestException } = require("../modules/Exception");
const patternTest = require("../modules/patternTest");

class CreateReviewDto {
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
     *
     */
    score;
    constructor(data) {
        this.account = data.account;
        this.productIdx = data.productIdx;
        this.content = data.content;
        this.score = data.score;
    }

    /**
     * @returns {void}
     * @throws {BadRequestException}
     */
    validate() {
        if (!this.productIdx || typeof this.productIdx !== "number") {
            throw new BadRequestException("productIdx 오류");
        }
        if (!patternTest("content", content)) {
            throw new BadRequestException("content 오류");
        }
        if (!patternTest("score", score)) {
            throw new BadRequestException("score 오류");
        }
    }

    createReview() {
        this.validate();
        return new Review({
            account: this.account,
            productIdx: this.productIdx,
            content: this.content,
            score: this.score,
        });
    }
}
