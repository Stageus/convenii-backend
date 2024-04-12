const Product = require("../../entity/Product");

class ProductDataDto {
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
     * @type {Date}
     */
    createdAt;

    /**
     * @type {boolean}
     */
    bookmarked;

    /**
     * @param {Product} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.categoryIdx = data.category_idx;
        this.name = data.name;
        this.price = data.price;
        this.productImg = data.image_url;
        this.score = data.score;
        this.createdAt = data.created_at;
        this.bookmarked = data.bookmarked;
    }

    validate() {}
}

module.exports = ProductDataDto;
