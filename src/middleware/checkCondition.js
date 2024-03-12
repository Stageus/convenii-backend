const checkCondition = (input, pattern, trim = false) => (req, res, next) => {
    try {
        let value = req.body[input];
        if (trim) {
            value = value.trim();
        }
        if (!pattern.test(value)) {
            const error = new Error(`${input}이(가) 입력 양식에 맞지 않음`);
            error.status = 400;
            throw error;
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = checkCondition;