const { checkLogin } = require("../../account/account.service");
const { UnauthorizedException } = require("../module/Exception");

/**
 *
 * @param {number} needRank
 * @returns {Function}
 */
const accountAuth =
    (needRank = 0) =>
    async (req, res, next) => {
        const token = req.headers.authorization;
        const user = await checkLogin(token);
        if (user.rankIdx < needRank) {
            let message = "No permission";
            if (user.authStatus === "expired") {
                message = "token expired";
            }
            next(new UnauthorizedException(message));
        }
        req.user = user;
        next();
    };

module.exports = accountAuth;
