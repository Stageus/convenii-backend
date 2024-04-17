const EventWithMonth = require("../model/eventWithMonth.model");
const EventEntity = require("./EventEntity");
const Event = require("../model/event.model");

class EventInfoEntity {
    /**
     * @type {string}
     */
    month;

    /**
     * @type {Event[]}
     */
    events;

    /**
     *
     * @param {
     *  month:string,
     *  events: Event[]
     * } data
     */
    constructor(data) {
        this.month = data.month;
        this.events = data.events;
    }

    /**
     *
     * @param {EventWithMonth} event
     * @returns {EventInfoEntity}
     */
    static createEntity(event) {
        return new EventInfoEntity({
            month: event.month,
            events: event.eventInfo?.map((event) => EventEntity.createEntity(event)) ?? null,
        });
    }
}

module.exports = EventInfoEntity;
