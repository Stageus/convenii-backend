const jwt = require("jsonwebtoken");

const isLogin = async (req, res, next) => {
    const token = req.headers.authorization;
    try {
        if (!token) {
            throw new Error("no token");
        }

        jwt.verify(token, process.env.SECRET_KEY);
        const payload = token.split(".")[1];
        const convert = Buffer.from(payload, "base64");
        const data = JSON.parse(convert.toString());
        req.user = data;

        if (req.user.rank !== 2) {
            throw new Error("권한 없음");
        }
        next();
    } catch (error) {
        let status = 403;
        const message = (() => {
            if (error.message === "no token") {
                return "토큰이 없음";
            } else if (error.message === "jwt expired") {
                return "토큰이 끝남";
            } else if (error.message === "invalid token") {
                return "토큰이 조작됨";
            } else if (error.message === "권한없음") {
                status = 401;
                return error.message;
            } else {
                return "오류 발생";
            }
        })();
        res.status(status).send({ message });
    }
};

module.exports = isLogin;
