const Account = require("../../util/module/Account");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class GetProductsBySearchDto {
    /**
     * @type {Account}
     */
    account;

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
     * @type {number}
     */
    pageOffset;

    /**
     *
     * @param {{
     *  account: Account,
     *  keyword: string,
     *  categoryFilter: number[],
     *  eventFilter: number[],
     *  pageOffset: number
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.keyword = data.keyword;
        this.categoryFilter = data.categoryFilter;
        this.eventFilter = data.eventFilter;
        this.pageOffset = data.pageOffset;
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
        console.log(eventFilter);
        if (!patternTest("page", page)) {
            throw new BadRequestException("page Error");
        }
        if (!patternTest("keyword", keyword)) {
            throw new BadRequestException("keyword error");
        }
        // if (!(eventFilter.length === 0 || eventFilter.every(Number.isInteger))) {
        //     throw new BadRequestException("eventFilter error");
        // }
        // if (!(categoryFilter.length === 0 || categoryFilter.every(Number.isInteger))) {
        //     throw new BadRequestException("eventFilter error");
        // }
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

        return new GetProductsBySearchDto({
            account: user,
            keyword: query.keyword,
            categoryFilter: !query.categoryFilter ? [1, 2, 3, 4, 5, 6] : query.categoryFilter,
            eventFilter: !query.eventFilter ? [1, 2, 3, 4, 5, 6] : query.eventFilter,
            pageOffset: (parseInt(query.page) - 1) * process.env.PAGE_SIZE_OPTION,
        });
    }
}

module.exports = GetProductsBySearchDto;
