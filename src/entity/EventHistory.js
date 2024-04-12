class EventHistory {
    /**
     * @type {number}
     */
    idx;

    /**
     * @type {number}
     */
    company_idx;

    /**
     * @type {number}
     */
    product_idx;

    /**
     * @type {number}
     */
    event_idx;

    /**
     * @type {Date}
     */
    start_date;

    /**
     * @type {string}
     */
    price;

    /**
     * @param {
     *  idx: number;
     *  company_idx: number;
     *  product_idx: number;
     *  event_idx: number|null;
     *  start_date: Date;
     *  price: string;
     * } data
     */
    constructor(data) {
        this.idx = data.idx;
        this.company_idx = data.company_idx;
        this.product_idx = data.product_idx;
        this.event_idx = data.event_idx;
        this.start_date = data.start_date;
        this.price = data.price;
    }
}

module.exports = EventHistory;
