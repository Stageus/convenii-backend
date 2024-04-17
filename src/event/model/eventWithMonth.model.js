const Event = require("./event.model");

class EventWithMonth {
    /**
     * @type {string}
     */
    month;

    /**
     * @type {Event[]}
     */
    events;
}

module.exports = EventWithMonth;
