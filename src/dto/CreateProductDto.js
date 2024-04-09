const { BadRequestException } = require("../modules/Exception");
const { Product } = require("../entity/Product");
class CreateProductDto {
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
     * @type {number}
     */
    price;

    /**
     * @type {string}
     */
    productImg;

    /**
     * @type {number}
     */
    score;

    /**
     * @type {Date}
     */
    createdAt;

    /**
     * @type {boolean}
     */
    bookmarkState;

    /**
     * @param {{
     *  idx: number;
     *  categoryIdx: number;
     *  name: string;
     *  price: number;
     *  productImg: string;
     *  score: number;
     *  createdAt: Date;
     *  bookmarkState: boolean;
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
        this.bookmarkState = data.bookmarkState;
    }

    validate() {
        if (!this.idx || typeof this.idx !== "number") {
            throw new BadRequestException("productIdx 오류");
        }
        if (!this.categoryIdx || typeof this.categoryIdx !== "number") {
            throw new BadRequestException("categoryIdx 오류");
        }
        if (typeof this.name !== "string" || this.name.trim().length === 0) {
            throw new BadRequestException("name 오류");
        }
        if (typeof this.price !== "string" || parseInt(this.price) <= 0) {
            throw new BadRequestException("price 오류");
        }
        if (typeof this.productImg !== "string" || !this.productImg.trim()) {
            throw new BadRequestException("productImg 오류");
        }
        if (typeof this.score !== "number" || this.score < 0 || this.score > 5) {
            throw new BadRequestException("score 오류");
        }
        if (!(this.createdAt instanceof Date) || isNaN(this.createdAt.getTime())) {
            throw new BadRequestException("createdAt 오류");
        }
        if (typeof this.bookmarkState !== "boolean") {
            throw new BadRequestException("bookmarkState  오류");
        }
    }

    /**
     *
     * @returns {Product}
     * @throws {BadRequestException}
     */
    createProduct() {
        this.validate();
        return new Product({
            idx: this.idx,
            categoryIdx: this.categoryIdx,
            name: this.name,
            price: this.price,
            productImg: this.productImg,
            score: this.score,
            createdAt: this.createdAt,
            bookmarkState: this.bookmarkState,
        });
    }
}

module.exports = CreateProductDto;
