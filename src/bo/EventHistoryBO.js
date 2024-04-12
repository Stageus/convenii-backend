const Event = require("../../entity/Event");

class EventHistoryBO {
    /**
     * @type {Array<{
     *  month: string,
     *  events: Event,
     *
     * }>}
     */
    eventHistory;

    /**
     * @param {Array<{
     *  month: string,
     *  events: Event,
     *
     * }>} data
     */
    constructor(data) {
        this.eventHistory = data.map((item) => ({
            month: item.month,
            events: item.events.map((event) => ({
                companyIdx: event.companyIdx,
                eventIdx: event.eventIdx,
                price: event.price,
            })),
        }));
    }
}

module.exports = EventHistoryBO;
