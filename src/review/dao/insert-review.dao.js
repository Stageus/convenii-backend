const Account = require("../../account/model/account.model");
module.exports = class InsertReivewDao {
    /**
     * @type {Account}
     */
    account;

    /**
     * @type {number}
     */
    productIdx;

    /**
     * @type {string}
     */
    content;

    /**
     * @type {number}
     */
    score;
};
