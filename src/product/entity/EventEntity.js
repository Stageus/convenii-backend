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

    /**
     *
     * @param {Event} event
     * @returns {EventEntity}
     */
    static createEntity(event) {
        return new EventEntity({
            companyIdx: event.companyIdx,
            eventIdx: event.eventIdx,
            month: event.month,
        });
    }
}

module.exports = EventEntity;
