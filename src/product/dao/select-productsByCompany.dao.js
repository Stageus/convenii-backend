const Account = require("../../account/model/account.model");

class SelectProductsByCompanyDao {
    /**
     * @type {Account}
     */
    account;

    /**
     * @type {number}
     */
    companyIdx;
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

module.exports = SelectProductsByCompanyDao;
