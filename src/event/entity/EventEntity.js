const Event = require("../model/event.model");

class EventEntity {
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

    /**
     *
     * @param {Event} data
     */
    constructor(data) {
        this.companyIdx = data.companyIdx;
        this.eventIdx = data.eventIdx;
        this.price = data.price;
    }

    /**
     *
     * @param {Event} event
     * @returns {EventEntity}
     */
    static createEntity(event) {
        return new EventEntity({
            companyIdx: event.companyIdx,
            eventIdx: event.eventIdx,
            price: event.price,
        });
    }
}

module.exports = EventEntity;
