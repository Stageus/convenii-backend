const Account = require("../../util/module/Account");

class SelectProductsAllDao {
    /**
     * @type {Account}
     */
    account;

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
