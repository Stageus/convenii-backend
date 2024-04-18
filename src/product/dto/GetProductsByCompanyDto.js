const Account = require("../../account/model/account.model");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class GetProductsByCompanyDto {
    /**
     * @type {Account}
     */
    account;

    /**
     * @type {number}
     */
    companyIdx;

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
     *  companyIdx: number,
     *  limit: number,
     *  offset: number,
     *  keyword: string,
     *  categoryFilter: number[],
     *  eventFilter: number[],
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.companyIdx = data.companyIdx;
        this.limit = data.limit;
        this.offset = data.offset;
        this.keyword = data.keyword;
        this.categoryFilter = data.categoryFilter;
        this.eventFilter = data.eventFilter;
    }

    /**
     *
     * @param {number} page
     * @param {number} companyIdx
     * @param {string} option
     * @throws {BadRequestException}
     */
    static validate(page, companyIdx, option) {
        if (!patternTest("page", page)) {
            throw new BadRequestException("page Error");
        }
        if (!patternTest("idx", companyIdx) || companyIdx > process.env.COMPANY_SIZE) {
            throw new BadRequestException("companyIdx Error");
        }
        if (option !== "main" && option !== "all") {
            throw new BadRequestException("option error");
        }
    }

    /**
     *
     * @param {Account} user
     * @param {{
     *  page: number
     *  option: string
     * }} query
     * @param {{
     *  companyIdx: number
     * }} params
     * @returns {GetProductsByCompanyDto}
     */
    static createDto(user, query, params) {
        GetProductsByCompanyDto.validate(query.page, params.companyIdx, query.option);

        return new GetProductsByCompanyDto({
            account: user,
            companyIdx: params.companyIdx,
            limit: query.option === "main" ? process.env.PAGE_SIZE_OPTION : 3,
            offset: query.option === "main" ? 0 : (parseInt(query.page) - 1) * process.env.PAGE_SIZE_OPTION,
            keyword: "",
            categoryFilter: [1, 2, 3, 4, 5, 6],
            eventFilter: [1, 2, 3, 4, 5, 6],
        });
    }
}

module.exports = GetProductsByCompanyDto;
