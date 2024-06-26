const Account = require("../../account/model/account.model");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class GetProductsBySearchDto {
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
     * @param {{
     *  page: number
     *  keyword: string,
     *  categoryFilter: number[],
     *  eventFilter: number[],
     * }}
     * @throws {BadRequestException}
     */
    static validate({ page, keyword, eventFilter, categoryFilter }) {
        if (!patternTest("page", page)) {
            throw new BadRequestException("page Error");
        }
        if (!patternTest("keyword", keyword)) {
            throw new BadRequestException("keyword error");
        }
    }

    /**
     *
     * @param {Account} user
     * @param {{
     *  page: number,
     *  keyword: string,
     *  categoryFilter: number[],
     *  eventFilter: number[]
     * }} query
     * @returns {GetProductsBySearchDto}
     * @throws {BadRequestException}
     */
    static createDto(user, query) {
        GetProductsBySearchDto.validate({
            page: query.page,
            keyword: query.keyword,
            eventFilter: query.eventFilter,
            categoryFilter: query.categoryFilter,
        });

        const categoryFilter = JSON.parse(query.categoryFilter);
        const eventFilter = JSON.parse(query.eventFilter);

        return new GetProductsBySearchDto({
            account: user,
            keyword: query.keyword,
            limit: 10,
            offset: (query.page - 1) * 10,
            eventFilter: eventFilter && eventFilter.length > 0 ? eventFilter : [1, 2, 3, 4, 5, 6],
            categoryFilter: categoryFilter && categoryFilter.length > 0 ? categoryFilter : [1, 2, 3, 4, 5, 6],
        });
    }
}

module.exports = GetProductsBySearchDto;
