const Account = require("../../account/model/account.model");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class GetBookmarkedProductDto {
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
     *
     * @param {{
     *  account: Account,
     *  limit: number,
     *  offset: number
     * }} data
     */
    constructor(data) {
        this.account = data.account;
        this.limit = data.limit;
        this.offset = data.offset;
    }
    /**
     *
     * @param {number
     * } page
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
     * @param {req.query} query
     */
    static createDto(user, query) {
        GetBookmarkedProductDto.validate(query.page);
        return new GetBookmarkedProductDto({
            account: user,
            limit: process.env.PAGE_SIZE_OPTION,
            offset: (query.page - 1) * process.env.PAGE_SIZE_OPTION,
        });
    }
}
module.exports = GetBookmarkedProductDto;
