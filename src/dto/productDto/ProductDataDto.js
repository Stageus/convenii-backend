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
     * @param {{
     *  idx: number;
     *  category_idx: number;
     *  name: string;
     *  price: string;
     *  image_url: string;
     *  score: string;
     *  created_at: Date;
     *  bookmarked: boolean;
     * }} data
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
}

module.exports = ProductDataDto;
