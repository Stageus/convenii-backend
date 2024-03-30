const patterns = {
    email: /^[a-zA-Z0-9]{6,40}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    pw: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/,
    nickname: /^[a-zA-Z0-9가-힣]{3,10}$/,
    score: /^[0-5]$/,
    content: /^$|.{5,100}$/,
    page: /^[1-9]\d*$/,
};

const checkCondition =
    (input, trim = false) =>
    (req, res, next) => {
        try {
            let value = req.body[input];
            if (trim) {
                value = value.trim();
            }
            if (!patterns[input].test(value)) {
                const error = new Error(`${input}이(가) 입력 양식에 맞지 않음`);
                error.status = 400;
                throw error;
            }
            next();
        } catch (error) {
            next(error);
        }
    };

module.exports = checkCondition;
