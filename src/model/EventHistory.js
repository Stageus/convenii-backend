const { Event } = require("./Event");

class EventHistory {
    /**
     * @type {number}
     */
    companyIdx;

    /**
     * @type {number}
     */
    productidx;

    /**
     * @type {Event}
     */
    event;

    /**
     * @type {Date}
     */
    month;

    /**
     * @type {number}
     */
    price;

    /**
     *
     * @param {{
     *  compnayIdx = number;
     *  productIdx: number;
     *  event: Event;
     *  month: Date;
     *  price: number;
     * }} data
     */
    constructor(data) {
        this.companyIdx = data.companyIdx;
        this.productIdx = data.productIdx;
        this.event = data.event;
        this.month = data.month;
        this.price = data.price;
    }
}

module.exports = EventHistory;
