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
        this.events = data.events;
    }
}

module.exports = EventHistory;
