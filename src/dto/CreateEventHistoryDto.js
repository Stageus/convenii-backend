const EventHistory = require("../entity/EventHistory");
const { BadRequestException } = require("../modules/Exception");
const patternTest = require("../modules/patternTest");

class CreateEventHistoryDto {
    /**
     * @type {Date}
     */
    month;

    /**
     * @type {
     *      Array<{
     *          companyIdx: number,
     *          eventIdx: number,
     *          price: string | null
     *      }|null>
     * }
     */
    events;

    /**
     * @param {{
     *  month: string,
     *  events: Array<{
     *      companyIdx: number,
     *      eventIdx: number,
     *      price: string | null
     *  }>
     * }} data
     */
    constructor(data) {
        this.month = data.month;
        this.events = data.events;
    }

    validate() {
        if (patternTest("month", month)) {
            throw new BadRequestException("month error");
        }
    }
    /**
     *
     * @returns {EventHistory}
     * @throws {BadRequestException}
     */
    createEventHistory() {
        this.validate();
        return new EventHistory({
            month: this.month,
            events: this.events,
        });
    }
}

module.exports = CreateEventHistoryDto;
