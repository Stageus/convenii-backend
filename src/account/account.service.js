const CheckLoginDto = require("./dto/CheckLoginDto");
const AccountEntity = require("./entity/accountEntity");

/**
 *
 * @param {CheckLoginDto} checkLoginDto
 * @returns {Promise<AccountEntity>}
 */
const checkLogin = (checkLoginDto) => {
    const { token, needRank } = checkLoginDto;
    const user = AccountEntity.createEntity();
    user.updateFromToken(token);
    user.checkPermission(needRank);
    return user;
};

module.exports = {
    checkLogin,
};
