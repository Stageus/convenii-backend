const Event = require("../../event/model/event.model");
const { BadRequestException } = require("../../util/module/Exception");
const patternTest = require("../../util/module/patternTest");

class AmendProductDto {
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
     * @type {number}
     */
    productIdx;

    /**
     * @type {number[]}
     */
    companyList;

    /**
     * @type {number[]}
     */
    eventList;

    /**
     * @type {number[]}
     */
    priceList;

    /**
     *
     * @param {{
     *  categoryIdx: number,
     *  price: string,
     *  name: string,
     *  productImg: string,
     *  productIdx: number,
     *  companyList: number[],
     *  eventList: number[],
     *  priceList: number[]
     * }} data
     */
    constructor(data) {
        this.categoryIdx = data.categoryIdx;
        this.price = data.price;
        this.name = data.name;
        this.productImg = data.productImg;
        this.productIdx = data.productIdx;
        this.companyList = data.companyList;
        this.eventList = data.eventList;
        this.priceList = data.priceList;
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
     * @param {req.file} file
     * @param {req.body} body
     * @param {req.params} params
     * @returns {AmendProductDto}
     */
    static createDto(file, body, params) {
        AmendProductDto.validate(body.categoryIdx, body.price, body.name);

        const companyIdxArray = [];
        const eventIdxArray = [];
        const eventPriceArray = [];

        body.eventInfo.forEach((event) => {
            //companyIdx가 없으면 넣지 않는다
            if (event.companyIdx && event.companyIdx > 0 && event.companyIdx <= process.env.COMPANY_SIZE) {
                companyIdxArray.push(event.companyIdx);
                eventIdxArray.push(event.eventIdx);
                if (!event.eventPrice) {
                    event.eventPrice = null;
                }
                eventPriceArray.push(event.eventPrice);
            }
        });
        return new AmendProductDto({
            categoryIdx: body.categoryIdx,
            price: body.price,
            name: body.name,
            productImg: file?.location ?? null,
            productIdx: params.productIdx,
            companyList: companyIdxArray,
            eventList: eventIdxArray,
            priceList: eventPriceArray,
        });
    }
}

module.exports = AmendProductDto;
