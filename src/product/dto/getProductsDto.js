const Account = require("../../util/module/Account");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class GetProductsDto {
    /**
     * @type {Account}
     */
    account;

    /**
     * @type {number}
     */
    page;

    /**
     *
     * @param {{
     *  account: Account,
     *  page: number
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.page = data.page;
    }

    /**
     *
     * @param {number} page
     */
    static validate(page) {
        if (!patternTest("page", page)) {
            throw new BadRequestException("page Error");
        }
    }

    /**
     *
     * @param {Account} user
     * @param {{
     *  page:number
     * }} query
     * @returns {GetProductsDto}
     */
    static createGetProductsDto(user, query) {
        validate(query.name);
        return new GetProductsDto({
            account: user,
            page: query.page,
        });
    }
}

module.exports = GetProductsDto;
