class Product {
    /**
     * @type {number}
     */
    idx;
    /**
     * @type {Category}
     */
    category;
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
     *  category: Category;
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
        this.category = data.category;
        this.name = data.name;
        this.price = data.price;
        this.productImg = data.productImg;
        this.score = data.score;
        this.createdAt = data.createdAt;
        this.bookmarkState = data.bookmarkState;
    }
}

module.exports = Product;
