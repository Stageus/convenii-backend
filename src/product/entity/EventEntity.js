const Event = require("../dao/event.dao");

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
    static createEventEntity(event) {
        return new EventEntity({
            companyIdx: event.companyIdx,
            eventIdx: event.eventIdx,
            month: event.month,
        });
    }
}

module.exports = EventEntity;
