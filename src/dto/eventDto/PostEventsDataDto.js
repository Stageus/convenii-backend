const Event = require("../../entity/Event");
const { BadRequestException } = require("../../modules/Exception");
const patternTest = require("../../modules/patternTest");
const COMPANY_SIZE = 3;
class PostEventsDataDto {
    /**
     * @type {number}
     */
    productIdx;

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
    eventPriceArray;

    /**
     *
     * @param {
     *  productIdx:number
     *  events:Array<Event>
     * } data
     *
     * @throws {BadRequestException}
     */
    constructor(data) {
        this.productIdx = this.productIdx;
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

    /**
     * @throws {BadRequestException}
     */
    validtate() {
        if (!patternTest("idx", this.productIdx)) {
            throw new BadRequestException("productIdx error");
        }
        if (this.companyIdxArray.length === 0) {
            throw new BadRequestException("event error");
        }
    }
}

module.exports = PostEventsDataDto;
