const Account = require("../../util/module/Account");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class GetProductByIdxDto {
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
            throw new BadRequestException("productIdx Error");
        }
    }

    /**
     *
     * @param {Account} user
     * @param {{
     *  productIdx:number
     * }} params
     * @returns {GetProductByIdxDto}
     */
    static createDto(user, params) {
        GetProductByIdxDto.validate(params.productIdx);
        return new GetProductByIdxDto({
            account: user,
            productIdx: params.productIdx,
        });
    }
}

module.exports = GetProductByIdxDto;
