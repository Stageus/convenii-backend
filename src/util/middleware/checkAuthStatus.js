const jwt = require("jsonwebtoken");
const Account = require("../module/Account");
const { UnauthorizedException } = require("../module/Exception");

module.exports = async (req, res, next) => {
    const token = req.headers.authorization;

    const user = Account.createAccount();
    try {
        if (!token) {
            throw new UnauthorizedException("no token");
        }

        jwt.verify(token, process.env.SECRET_KEY);

        const payload = token.split(".")[1];
        const convert = Buffer.from(payload, "base64");
        const data = JSON.parse(convert.toString());
        user.getLoginStatus(data);
        req.user = user;
        next();
    } catch (err) {
        req.user = user;
        if (err.message === "jwt expired") {
            user.isExpired();
            next();
        } else if (err.message === "no token") {
            next();
        } else {
            next(new UnauthorizedException(err.message));
        }
    }
};
