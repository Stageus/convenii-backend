const Event = require("../../entity/Event");
const { BadRequestException } = require("../../modules/Exception");
const patternTest = require("../../modules/patternTest");
const COMPANY_SIZE = 3;
class PostProductDataDto {
    /**
     * @type {number}
     */
    categoryIdx;

    /**
     * @type {string}
     */
    name;

    /**
     * @type {string}
     */
    price;

    /**
     * @type {string}
     */
    productImg;

    /**
     *
     * @param {
     *  categoryIdx: number,
     *  name string,
     *  price: string,
     *  productImg: string,
     * } data
     *
     * @throws {BadRequestException}
     */
    constructor(data) {
        this.categoryIdx = data.categoryIdx;
        this.name = data.name;
        this.price = data.price;
        this.productImg = data.productImg;

        this.validtate();
    }

    /**
     * @throws {BadRequestException}
     */
    validtate() {
        if (!patternTest("idx", this.categoryIdx)) {
            throw new BadRequestException("categoryIdx error");
        }
        if (!patternTest("name", this.name)) {
            throw new BadRequestException("name error");
        }
        if (!patternTest("price", this.price)) {
            throw new BadRequestException("price error");
        }
    }
}

module.exports = PostProductDataDto;
