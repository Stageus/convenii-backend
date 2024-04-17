const EventInfo = require("./eventInfo.model");

class Product {
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
}

module.exports = Product;
