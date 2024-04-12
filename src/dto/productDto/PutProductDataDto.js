const Event = require("../../entity/Event");
const { BadRequestException } = require("../../modules/Exception");
const patternTest = require("../../modules/patternTest");
const COMPANY_SIZE = 3;
class PutProductDataDto {
    /**
     * @type {number}
     */
    productIdx;

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
     * @type {string | null}
     */
    productImg;

    /**
     *
     * @param {
     *  productIdx: number
     *  categoryIdx: number,
     *  name string,
     *  price: string,
     *  productImg: string | null,
     * } data
     *
     * @throws {BadRequestException}
     */
    constructor(data) {
        this.productIdx = data.productIdx;
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

    /**
     *
     * @returns {boolean}
     */
    haveImg() {
        return this.productImg ? true : false;
    }
    /**
     *
     * @returns {[categoryIdx,name, price, productImg]}
     */
    toParams() {
        const array = [this.productIdx, this.categoryIdx, this.name, this.price];
        if (this.productImg) {
            array.push(this.productImg);
        }
        return array;
    }
}

module.exports = PutProductDataDto;
