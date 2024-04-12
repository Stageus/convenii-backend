const patternTest = require("../modules/patternTest");

const getReviews = async (productIdx, page) => {
    const pageSizeOption = 10;

    if (!patternTest("page", page)) {
        throw new BadRequestException("page 입력 오류");
    }
};

module.exports = {
    getReviews,
};
