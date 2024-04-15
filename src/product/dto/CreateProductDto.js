const Event = require("../dao/event.dao");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class CreateProductDto {
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
     * @type {Event}
     */
    events;

    /**
     *
     * @param {{
     *  categoryIdx: number,
     *  price: string,
     *  name: string,
     *  productImg: string,
     *  events: Event[]
     * }} data
     */
    constructor(data) {
        this.categoryIdx = data.categoryIdx;
        this.price = data.price;
        this.name = data.name;
        this.productImg = data.productImg;
        this.events = data.events;
    }

    /**
     *
     * @param {number} categoryIdx
     * @throws {BadRequestException}
     */
    static validate(categoryIdx) {
        if (!patternTest("idx", categoryIdx)) {
            throw new BadRequestException("categoryIdx Error");
        }
    }

    /**
     *
     * @param {Account} user
     * @param {{
     *  productIdx:number
     * }} params
     * @returns {CreateProductDto}
     */
    static createDto(file, body) {
        CreateProductDto.validate(body.categoryIdx, body.price, body.name);
        return new CreateProductDto({
            categoryIdx: body.categoryIdx,
            price: body.price,
            name: body.name,
            productImg: file.location,
            events: body.eventInfo,
        });
    }
}

module.exports = CreateProductDto;
