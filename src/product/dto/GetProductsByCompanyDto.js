const Account = require("../../util/module/Account");
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
    pageLimit;

    /**
     * @type {number}
     */
    pageOffset;

    /**
     *
     * @param {{
     *  account: Account,
     *  companyIdx: number,
     *  pageLimit: number,
     *  pageOffset: number
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.companyIdx = data.companyIdx;
        this.pageLimit = data.pageLimit;
        this.pageOffset = data.pageOffset;
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
            pageLimit: query.option === "main" ? process.env.PAGE_SIZE_OPTION : 3,
            pageOffset: query.option === "main" ? 0 : (parseInt(query.page) - 1) * process.env.PAGE_SIZE_OPTION,
        });
    }
}

module.exports = GetProductsByCompanyDto;
