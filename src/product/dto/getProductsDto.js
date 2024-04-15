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
    limit;

    /**
     * @type {number}
     */
    offset;

    /**
     * @type {string}
     */
    keyword;

    /**
     * @type {number[]}
     */
    categoryFilter;

    /**
     * @type {number[]}
     */
    eventFilter;

    /**
     *
     * @param {{
     *  account: Account,
     *  limit: number,
     *  offset: number,
     *  keyword: string,
     *  categoryFilter: number[],
     *  eventFilter: number[],
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.limit = data.limit;
        this.offset = data.offset;
        this.keyword = data.keyword;
        this.categoryFilter = data.categoryFilter;
        this.eventFilter = data.eventFilter;
    }

    /**
     *
     * @param {number} categoryFilter
     * @throws {BadRequestException}
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
    static createDto(user, query) {
        GetProductsDto.validate(query.page);
        return new GetProductsDto({
            account: user,
            limit: 10,
            offset: (query.page - 1) * 10,
            keyword: "",
            categoryFilter: [1, 2, 3, 4, 5, 6],
            eventFilter: [1, 2, 3, 4, 5, 6],
        });
    }
}

module.exports = GetProductsDto;
