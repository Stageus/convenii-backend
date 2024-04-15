class SelectProductsAllDao {
    /**
     * @type {number}
     */
    accountIdx;

    /**
     * @type {number}
     */
    limit;

    /**
     * @type {number}
     */
    offset;

    /**
     * @type {string}
     */
    keyword;

    /**
     * @type {number[]}
     */
    categoryFilter;

    /**
     * @type {number[]}
     */
    eventFilter;
}

module.exports = SelectProductsAllDao;
