const jwt = require("jsonwebtoken");

function issueToken(payload, options) {
    return jwt.sign(payload, process.env.SECRET_KEY, options);
}

module.exports = issueToken;