const checkSame = (input1, input2) => (req, res, next) => {
    const value1 = req.body[input1];
    const value2 = req.body[input2];

    if (!value2 || value2 !== value1) {
        const error = new Error(`${input1}이(가) 일치하지 않음`);
        error.status = 400;
        return next(error);
    }
    next();
};

module.exports = checkSame;