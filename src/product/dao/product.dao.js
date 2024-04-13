class Product {
    /**
     * @typedef {
     *  companyIdx,
     *  eventIdx,
     *  month,
     * } Event
     */

    /**
     * @type {number}
     */
    idx;

    /**
     * @type {number}
     */
    categoryIdx;

    /**
     * @type {string}
     */
    name;

    /**
     * @type {string}
     */
    price;

    /**
     * @type {string}
     */
    productImg;

    /**
     * @type {string}
     */
    score;

    /**
     * @type {string}
     */
    createdAt;

    /**
     * @type {boolean}
     */
    bookmarked;
    /**
     *@type {Event[]}
     */
    events;

    /**
     *
     * @param {{
     *  idx:number,
     *  categoryIdx: number,
     *  name: string,
     *  price: string,
     *  productImg: string,
     *  score: string,
     *  createdAt: string,
     *  bookmarked: boolean,
     *  events: Event,
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.categoryIdx = data.categoryIdx;
        this.name = data.name;
        this.price = data.price;
        this.productImg = data.productImg;
        this.score = data.score;
        this.createdAt = data.createdAt;
        this.bookmarked = data.bookmarked;
        this.events = data.events;
    }
}

module.exports = Product;
