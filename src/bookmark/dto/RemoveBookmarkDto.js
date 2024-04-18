const Account = require("../../account/model/account.model");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class RemoveBookmarkDto {
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
     * @returns {RemoveBookmarkDto}
     */
    static createDto(user, params) {
        RemoveBookmarkDto.validate(params.productIdx);
        return new RemoveBookmarkDto({
            account: user,
            productIdx: params.productIdx,
        });
    }
}

module.exports = RemoveBookmarkDto;
