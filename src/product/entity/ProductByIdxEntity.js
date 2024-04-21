const Product = require("../model/product.model");
const EventInfo = require("../../event/model/eventWithMonth.model");
const EventInfoEntity = require("../../event/entity/EventInfoEntity");
const Event = require("../../event/model/event.model");
class ProductByIdxEntity {
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
     *@type {EventInfo[]}
     */
    eventInfo;

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
     *  eventInfo: EventInfo[],
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
        this.eventInfo = data.eventInfo;
    }

    /**
     *
     * @param {Product} product
     * @param {Event} eventWithMonth
     */
    static createEntityFromDao(product, eventWithMonth) {
        let score = product.score;
        if (product.score === null) {
            score = 0;
        }
        return new ProductByIdxEntity({
            idx: product.idx,
            categoryIdx: product.categoryIdx,
            name: product.name,
            price: product.price,
            productImg: product.productImg,
            score: score,
            createdAt: product.createdAt,
            bookmarked: product.bookmarked,
            eventInfo: eventWithMonth?.map((events) => EventInfoEntity.createEntity(events)),
        });
    }
}

module.exports = ProductByIdxEntity;
