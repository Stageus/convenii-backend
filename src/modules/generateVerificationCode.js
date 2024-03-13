const crypto = require("crypto");

function generateVerificationCode() {
    const length = 6;
    const randomBytes = crypto.randomBytes(length);
    const verificationCode = randomBytes.toString("hex").slice(0, length);

    return verificationCode;
}

module.exports = generateVerificationCode;