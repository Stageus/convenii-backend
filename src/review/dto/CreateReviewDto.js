const Account = require("../../account/model/account.model");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

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
     */
    score;

    /**
     *
     * @param {{
     *  account:Account,
     *  productIdx: number,
     *  content: string,
     *  score: number
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.productIdx = data.productIdx;
        this.content = data.content;
        this.score = data.score;
    }

    /**
     *
     * @param {req.body} body
     * @param {req.params} params
     * @throws {BadRequestException}
     */
    static validate(body, params) {
        if (!patternTest("idx", params.productIdx)) {
            throw new BadRequestException("productIdx error");
        }
        if (!patternTest("content", body.content)) {
            throw new BadRequestException("productIdx error");
        }
        if (!patternTest("score", body.score)) {
            throw new BadRequestException("productIdx error");
        }
    }

    /**
     *
     * @param {Account} user
     * @param {req.body} body
     * @param {req.params} params
     * @returns {CreateReviewDto}
     */
    static createDto(user, body, params) {
        CreateReviewDto.validate(body, params);
        return new CreateReviewDto({
            account: user,
            productIdx: params.productIdx,
            content: body.content,
            score: body.score,
        });
    }
}

module.exports = CreateReviewDto;
