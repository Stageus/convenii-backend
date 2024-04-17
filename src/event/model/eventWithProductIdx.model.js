const Event = require("./event.model");

class EventWithProductIdx {
    /**
     * @type {string}
     */
    productIdx;

    /**
     * @type {Event[]}
     */
    events;
}

module.exports = EventWithProductIdx;
