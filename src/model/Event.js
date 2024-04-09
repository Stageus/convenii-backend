class Event {
    /**
     * @type {number}
     */
    idx;

    /**
     * @type {string}
     */
    type;

    /**
     * @type {number}
     */
    priority;

    /**
     *
     * @param {{
     *  idx: number;
     *  type: string;
     *  priority: number;
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.type = data.type;
        this.priority = data.priority;
    }
}

module.exports = Event;
