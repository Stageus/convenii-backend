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
     * @param {EventWithMonth} eventInfo
     * @returns {EventInfoEntity}
     */
    static createEntity(eventInfo) {
        return new EventInfoEntity({
            month: eventInfo.month,
            events: EventEntity.createEntity(eventInfo.events),
        });
    }
}

module.exports = EventInfoEntity;
