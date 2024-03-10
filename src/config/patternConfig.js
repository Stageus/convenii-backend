const emailPattern = /^[a-zA-Z0-9]{6,40}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const pwPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
const nicknamePattern = /^[a-zA-Z0-9가-힣]{3,10}$/;

module.exports = { emailPattern, pwPattern, nicknamePattern };