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
        this.productIdx = data.productIdx;
        this.limit = data.limit;
        this.offset = data.offset;
    }

    /**
     *
     * @param {req.query} query
     * @param {req.params} params
     * @throws {BadRequestException}
     */
    static validate(query, params) {
        if (!patternTest("page", query.page)) {
            throw new BadRequestException("page error");
        }
        if (!patternTest("idx", params.productIdx)) {
            throw new BadRequestException("productIdx error");
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
        GetReviewsDto.validate(query, params);
        const pageSizeOption = process.env.PAGE_SIZE_OPTION;
        return new GetReviewsDto({
            productIdx: params.productIdx,
            limit: pageSizeOption,
            offset: (parseInt(query.page) - 1) * pageSizeOption,
        });
    }
}

module.exports = GetReviewsDto;
