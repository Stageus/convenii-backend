const jwt = require("jsonwebtoken");
const Account = require("../entity/Account");

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
    req.isLogin = "false";
    try {
        if (!token) {
            throw new Error("no token");
        }

        jwt.verify(token, process.env.SECRET_KEY);

        const payload = token.split(".")[1];
        const convert = Buffer.from(payload, "base64");
        const data = JSON.parse(convert.toString());
        req.user = data;
        req.isLogin = "true";

        next();
    } catch (error) {
        req.user = {
            idx: 0,
            email: null,
            rank: null,
        };
        if (error.message === "jwt expired") {
            req.isLogin = "expired";
            next();
        } else if (error.message === "no token") {
            req.isLogin = "false";
            next();
        } else {
            res.status(401).send(error);
        }
    }
};
