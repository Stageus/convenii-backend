class EventHistory {
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
     *      }>
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
        this.events = data.events.map(
            (eventData) =>
                new Event({
                    companyIdx: eventData.companyIdx,
                    eventIdx: eventData.eventIdx,
                    price: eventData.price,
                })
        );
    }
}

module.exports = EventHistory;
