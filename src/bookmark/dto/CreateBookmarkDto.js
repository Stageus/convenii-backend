const Account = require("../../account/model/account.model");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class CreateBookmarkDto {
    /**
     * @type {Account}
     */
    account;

    /**
     * @type {number}
     */
    productIdx;

    /**
     *
     * @param {{
     *  account: Account,
     *  productIdx: number
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.productIdx = data.productIdx;
    }

    /**
     *
     * @param {number} productIdx
     * @throws {BadRequestException}
     */
    static validate(productIdx) {
        if (!patternTest("idx", productIdx)) {
            throw new BadRequestException("productIdx error");
        }
    }

    /**
     *
     * @param {Account} user
     * @param {req.params} params
     * @returns {CreateBookmarkDto}
     */
    static createDto(user, params) {
        CreateBookmarkDto.validate(params.productIdx);
        return new CreateBookmarkDto({
            account: user,
            productIdx: params.productIdx,
        });
    }
}

module.exports = CreateBookmarkDto;
