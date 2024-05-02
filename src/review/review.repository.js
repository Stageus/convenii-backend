const pgPool = require("../../src/util/module/pgPool");
const query = require("../util/module/query");
const InsertReivewDao = require("./dao/insert-review.dao");
const SelectReviewsDao = require("./dao/select-reviews.dao");
const UpdateScoreDao = require("./dao/update-score.dao");
const Review = require("./model/review.model");

/**
 *
 * @param {InsertReivewDao} insertReviewDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<pg.QueryResult>}
 */
const insertReivew = async (insertReviewDao, conn = pgPool) => {
    return await query(
        `
        INSERT INTO
            review (product_idx, account_idx, content, score)
        VALUES
            ($1,$2,$3,$4)`,
        [insertReviewDao.productIdx, insertReviewDao.account.idx, insertReviewDao.content, insertReviewDao.score],
        conn
    );
};

/**
 *
 * @param {UpdateScoreDao} updateScoreDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<pg.QueryResult>}
 */
const updateScore = async (updateScoreDao, conn = pgPool) => {
    return await query(
        `
        UPDATE product SET score = (
            SELECT
                AVG (score)
            FROM
                review
            WHERE
                product_idx = $1
        )
        WHERE idx = $1
        `,
        [updateScoreDao.productIdx],
        conn
    );
};

/**
 *
 * @param {SelectReviewsDao} selectReviewsDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<Review[]>}
 */
const selectReviews = async (selectReviewsDao, conn = pgPool) => {
    const queryResult = await query(
        `
        SELECT
            review.idx,
            review.product_idx AS "productIdx",
            account.idx AS "accountIdx",
            account.nickname,
            review.content,
            review.score,
            review.created_at AS "createdAt"
        FROM
            review
        JOIN
            account
        ON
            account.idx = review.account_idx
        WHERE
            review.product_idx = $1
        ORDER BY
            review.idx DESC
        LIMIT $2 OFFSET $3
        `,
        [selectReviewsDao.productIdx, selectReviewsDao.limit, selectReviewsDao.offset],
        conn
    );

    return queryResult.rows;
};

module.exports = {
    insertReivew,
    updateScore,
    selectReviews,
};
