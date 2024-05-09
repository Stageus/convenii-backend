const Event = require("../../event/model/event.model");
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
     * @param {Account} user
     * @param {{
     *  productIdx:number
     * }} params
     * @returns {CreateProductDto}
     */
    static createDto(file, body) {
        CreateProductDto.validate(body.categoryIdx, body.price, body.name);

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
        return new CreateProductDto({
            categoryIdx: body.categoryIdx,
            price: body.price,
            name: body.name,
            productImg: file?.location ?? "no_image",
            productIdx: -1,
            companyList: companyIdxArray,
            eventList: eventIdxArray,
            priceList: eventPriceArray,
        });
    }

    /**
     * dto에 productIdx를 넣는 함수
     * @param {number} data
     */
    withProductIdx(data) {
        this.productIdx = data.idx;
        return this;
    }
}

module.exports = CreateProductDto;
