const wrapper = (requestHandler) => {
    return async (req, res, next) => {
        try {
            requestHandler(req, res, next);
        } catch (err) {
            return next(err);
        }
    };
};

module.exports = wrapper;
