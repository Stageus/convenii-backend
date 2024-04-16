const Product = require("../model/product.model");
const EventEntity = require("./EventEntity");

class ProductEntity {
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

    /**
     *
     * @param {Product} product
     */
    static createEntityFromDao(product) {
        return new ProductEntity({
            idx: product.idx,
            categoryIdx: product.categoryIdx,
            name: product.name,
            price: product.price,
            productImg: product.productImg,
            score: product.score,
            createdAt: product.createdAt,
            bookmarked: product.bookmarked,
            events: product.events.map((event) => EventEntity.createEntity(event)),
        });
    }
}

module.exports = ProductEntity;
