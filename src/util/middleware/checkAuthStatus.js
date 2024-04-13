const jwt = require("jsonwebtoken");
const Account = require("../entity/Account");
const { UnauthorizedException } = require("../modules/Exception");

module.exports = async (req, res, next) => {
    const token = req.headers.authorization;
    const user = new Account({
        idx: 0,
        createdAt: null,
        email: null,
        nickname: null,
        rankIdx: null,
        isLogin: "false",
    });

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
    } catch (error) {
        if (error.message === "jwt expired") {
            user.isExpired();
            req.user = user;
            next();
        } else if (error.message === "no token") {
            req.user = user;
            next();
        } else {
            res.status(401).send(error);
        }
    }
};
