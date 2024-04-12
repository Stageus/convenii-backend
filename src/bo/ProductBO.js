const { BadRequestException } = require("../modules/Exception");
const patternTest = require("../modules/patternTest");

class ProductBO {
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
     * @param {{
     *  idx: number;
     *  categoryIdx: number;
     *  name: string;
     *  price: string;
     *  productImg: string;
     *  score: string;
     *  createdAt: Date;
     *  bookmarked: boolean;
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

        this.validate();
    }

    validate() {
        if (!this.idx || typeof this.idx !== "number") {
            throw new BadRequestException("productIdx 오류");
        }
        if (!this.categoryIdx || typeof this.categoryIdx !== "number") {
            throw new BadRequestException("categoryIdx 오류");
        }
        if (typeof this.name !== "string" || !patternTest("name", this.name)) {
            throw new BadRequestException("name 오류");
        }
        if (typeof this.price !== "string" || parseInt(this.price) <= 0) {
            throw new BadRequestException("price 오류");
        }
        if (typeof this.productImg !== null && typeof this.productImg !== "string") {
            console.log(this.productImg);
            throw new BadRequestException("productImg 오류");
        }
        if (typeof this.score !== null && (0 > parseFloat(this.score) || 5 < parseFloat(this.score))) {
            throw new BadRequestException("score 오류");
        }
        if (!(this.createdAt instanceof Date) || isNaN(this.createdAt.getTime())) {
            throw new BadRequestException("createdAt 오류");
        }
        if (typeof this.bookmarked !== "boolean") {
            throw new BadRequestException("bookmarked  오류");
        }
    }
}

module.exports = ProductBO;
