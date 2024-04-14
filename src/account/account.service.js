const AccountEntity = require("./entity/accountEntity");

/**
 *
 * @param {string|null} token
 * @returns {Promise<AccountEntity>}
 */
const checkLogin = (token) => {
    const user = AccountEntity.createEntity();
    user.updateFromToken(token);
    return user;
};

module.exports = {
    checkLogin,
};
