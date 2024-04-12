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
    price;

    /**
     *
     * @param {
     *  companyIdx: number;
     *  eventIdx: number;
     *  price: string;
     * } data
     */
    constructor(data) {
        this.companyIdx = data.companyIdx;
        this.eventIdx = data.eventIdx;
        this.price = data.price;
    }
}

module.exports = Event;
