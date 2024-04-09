class Event {
    /**
     * @type {number}
     */
    companyIdx;
    /**
     * @type {number}
     */
    eventIdx;
    /**
     * @type { string | null}
     */
    price;
    /**
     * @param {{
     *  companyIdx: number;
     *  eventIdx: number;
     *  price: string | null;
     * }} datass
     */
    constructor(data) {
        this.companyIdx = data.companyIdx;
        this.eventIdx = data.eventIdx;
        this.price = data.price;
    }
}
