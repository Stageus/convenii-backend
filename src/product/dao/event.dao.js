class Event {
    /**
     * @type {number}
     */
    companyIdx;

    /**
     * @type {number}
     */
    eventIdx;

    /**
     * @type {string}
     */
    month;

    /**
     *
     * @param {Event} data
     */
    constructor(data) {
        this.companyIdx = data.companyIdx;
        this.eventIdx = data.eventIdx;
        this.month = data.month;
    }
}

module.exports = Event;
