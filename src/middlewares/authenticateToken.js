const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization;

    try {
        if (!token) {
            next();
            return;
        }
        jwt.verify(token, process.env.SECRET_KEY);
        const payload = token.split(".")[1];
        const convert = Buffer.from(payload, "base64");
        const data = JSON.parse(convert.toString());
        req.user = data;
        next();
    } catch (error) {
        const message = (() => {
            if (error.message === "jwt expired") {
                return "토큰이 끝남";
            } else if (error.message === "invalid token") {
                return "토큰이 조작됨";
            } else {
                return "오류 발생";
            }
        })();
        res.status(401).send({ message });
    }
}

module.exports = authenticateToken;