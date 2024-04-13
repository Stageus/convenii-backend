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
    page;

    /**
     * @type {number}
     */
    companyIdx;

    /**
     * @type {string}
     */
    option;

    /**
     *
     * @param {{
     *  account: Account,
     *  page: number,
     *  companyIdx: number,
     *  option: string
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.page = data.page;
        this.companyIdx = data.companyIdx;
        this.string = data.companyIdx;
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
            page: query.page,
            companyIdx: params.companyIdx,
            option: query.option,
        });
    }
}

module.exports = GetProductsByCompanyDto;
