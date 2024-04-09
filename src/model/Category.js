class Category {
    /**
     * @type {number}
     */
    idx;

    /**
     * @type {string}
     */
    name;

    /**
     *
     * @param {{
     *  idx: number;
     *  name: string;
     * }} data
     */
    constructor(data) {
        this.idx = data.idx;
        this.name = data.name;
    }
}

module.exports = Product;
