const Event = require("../../entity/Event");
const { BadRequestException } = require("../../modules/Exception");
const patternTest = require("../../modules/patternTest");
const COMPANY_SIZE = 3;
class PostProductsWithEventsDataDto {
    /**
     * @type {number}
     */
    categoryIdx;

    /**
     * @type {string}
     */
    name;

    /**
     * @type {Array<number>}
     */
    companyIdxArray;

    /**
     * @type {Array<number>}
     */
    eventIdxArray;

    /**
     * @type {Array<string>}
     */
    eventPrice;

    /**
     *
     * @param {
     *  categoryIdx: number,
     *  name: string,
     *  events:Array<Event>
     * } data
     */
    constructor(data) {
        this.categoryIdx = data.categoryIdx;
        this.name = data.name;
        this.companyIdxArray = [];
        this.eventIdxArray = [];
        this.eventPriceArray = [];
        data.events.forEach((event) => {
            if (event.companyIdx && event.companyIdx > 0 && event.companyIdx <= COMPANY_SIZE) {
                companyIdxArray.push(event.companyIdx);
                eventIdxArray.push(event.eventIdx);
                if (!event.eventPrice) {
                    event.eventPrice = null;
                }
                eventPriceArray.push(event.eventPrice);
            }
        });
        this.validtate();
    }

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
        if (this.companyIdxArray.length === 0) {
            throw new BadRequestException("event error");
        }
    }
}

module.exports = PostProductsWithEventsDataDto;
