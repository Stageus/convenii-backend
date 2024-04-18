const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class GetReviewsDto {
    /**
     * @type {number}
     */
    productIdx;

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
     *  productIdx: number,
     *  limit: number,
     *  limit: number
     * }} data
     */
    constructor(data) {
        productIdx = data.productIdx;
        this.limit = data.limit;
        this.offset = data.offset;
    }

    /**
     *
     * @param {number} page
     * @throws {BadRequestException}
     */
    static validate(page) {
        if (!patternTest("page", page)) {
            throw new BadRequestException("page error");
        }
    }

    /**
     *
     * @param {req.query} query
     * @param {req.params} params
     * @returns {GetReviewsDto}
     * @throws {BadRequestException}
     */
    static createDto(query, params) {
        GetReviewsDto.validate(query.page);
        const pageSizeOption = process.env.PAGE_SIZE_OPTION;
        return new GetReviewsDto({
            productIdx: params.productIdx,
            limit: pageSizeOption,
            offset: (parseInt(params.page) - 1) * pageSizeOption,
        });
    }
}

module.exports = GetReviewsDto;
