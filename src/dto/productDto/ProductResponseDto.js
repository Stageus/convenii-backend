class ProductResponseDto {
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
    }
}

module.exports = ProductResponseDto;
