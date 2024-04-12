const patterns = {
    email: /^[a-zA-Z0-9]{6,40}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    pw: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/,
    month: /^\d{4}-(0[1-9]|1[0-2])$/,
    nickname: /^[a-zA-Z0-9가-힣]{3,10}$/,
    score: /^[0-5]$/,
    content: /^$|.{5,100}$/,
    page: /^[1-9]\d*$/,
    name: /^[가-힣a-zA-Z0-9]{2,40}$/,
    price: /^(?:[1-9][0-9]{2,6}|10000000)$/,
    keyword: /^(null|[d가-힣A-Za-z]{0,30})$/,
};
/**
 *
 * @param {string} dataName
 * @param {any} data
 * @returns {boolean}
 */
const patternTest = (dataName, data) => {
    return patterns[dataName].test(data);
};

module.exports = patternTest;
