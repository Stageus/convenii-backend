class Product {
    /**
     * @type {number}
     */
    idx;

    /**
     * @type {number}
     */
    category_idx;

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
    image_url;

    /**
     * @type {number}
     */
    score;

    /**
     * @type {Date}
     */
    created_at;

    /**
     * @type {boolean}
     */
    bookmarked;

    /**
     * @param {{
     *  idx: number;
     *  category_idx: number;
     *  name: string;
     *  price: number;
     *  image_url: string;
     *  score: number;
     *  created_at: Date;
     *  bookmarked: boolean;
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.category_idx = data.category_idx;
        this.name = data.name;
        this.price = data.price;
        this.image_url = data.image_url;
        this.score = data.score;
        this.created_at = data.created_at;
        this.bookmarked = data.bookmarked;
    }
}

module.exports = Product;
