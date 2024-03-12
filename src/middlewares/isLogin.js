const jwt = require("jsonwebtoken");

const isLogin = async (req, res, next) => {
    console.log(req.headers)
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
        next()
    } catch (error) {
        const message = (() => {
            if (error.message === "no token") {
                return "토큰이 없음";
            } else if (error.message === "jwt expired") {
                return "토큰이 끝남";
            } else if (error.message === "invalid token") {
                return "토큰이 조작됨";
            } else if (error.message === "invalid uuid") {
                return "중복로그인이 감지되어 재로그인 필요함";
            } else {
                return "오류 발생";
            }
        })();
        res.status(401).send({ message });
    }
};

module.exports = isLogin;