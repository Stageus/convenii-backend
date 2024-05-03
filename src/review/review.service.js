const { NotFoundException } = require("../util/module/Exception");
const pgPool = require("../util/module/pgPool");
const ReviewEntity = require("./Entity/ReviewEntity");
const CreateReviewDto = require("./dto/CreateReviewDto");
const GetReviewsDto = require("./dto/GetReviewsDto");
const { insertReivew, updateScore, selectReviews } = require("./review.repository");

/**
 *
 * @param {CreateReviewDto} createReviewDto
 * @returns {Promise<void>}
 */
const createReview = async (createReviewDto) => {
    const client = await pgPool.connect();

    try {
        await client.query("BEGIN");

        await insertReivew(createReviewDto, client);
        await updateScore(createReviewDto, client);

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

/**
 *
 * @param {GetReviewsDto} getReviewsDto
 * @returns {Promise<Review[]>}
 */
const getReviews = async (getReviewsDto) => {
    const reviewList = await selectReviews(getReviewsDto);
    // if (reviewList.length === 0) {
    //     throw new NotFoundException("no reiviews");
    // }

    return reviewList.map((review) => ReviewEntity.createEntityFromDao(review));
};

module.exports = {
    createReview,
    getReviews,
};
