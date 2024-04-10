const EventHistory = require("../entity/EventHistory");
const { BadRequestException } = require("../modules/Exception");

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
        const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

        if (!monthRegex.test(this.month)) {
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
