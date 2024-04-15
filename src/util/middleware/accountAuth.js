const { checkLogin } = require("../../account/account.service");
const CheckLoginDto = require("../../account/dto/CheckLoginDto");

const wrapper = require("../module/wrapper");

/**
 *
 * @param {RankGrade} needRank
 * @returns {Function}
 */
const accountAuth = (needRank = 0) =>
    wrapper(async (req, res, next) => {
        const user = await checkLogin(CheckLoginDto.createDto(req.headers, needRank));

        req.user = user;
        next();
    });

module.exports = accountAuth;
