const Event = require("../entity/Event");

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
        this.eventHistory = data.eventHistory.map((item) => ({
            month: item.month,
            events:
                item.events?.map((event) => ({
                    companyIdx: event.companyIdx,
                    eventIdx: event.eventIdx,
                    price: event.price,
                })) || null,
        }));
    }
}

module.exports = EventHistoryBO;
