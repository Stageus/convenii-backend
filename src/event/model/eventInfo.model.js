const Event = require("./event.model");

class EventInfo {
    /**
     * @type {string}
     */
    month;

    /**
     * @type {Event[]}
     */
    events;
}

module.exports = EventInfo;
