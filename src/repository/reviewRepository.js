const query = require("../modules/query");

/**
 *
 * @param {number} productIdx
 * @param {number} pageSizeOption
 * @param {number} page
 * @returns {Promise<
 *      idx: number,
 *      productIdx,
 *      nickName,
 *      content,
 *
 * >}
 */
const getReviewsData = async (productIdx, pageSizeOption, page) => {
    const reviews = await query(
        `
            SELECT
                review.product_idx AS "productIdx",
                review.content,
                review.score,
                review.created_at AS "createdAt",
            FROM
                review 
            JOIN
                account ON account.idx = review.account_idx
            WHERE
                review.product_idx = $1
            ORDER BY review.idx DESC
            LIMIT $2 OFFSET $3
            `,
        [productIdx, pageSizeOption, (parseInt(page) - 1) * pageSizeOption]
    );
    return reviews.rows;
};
module.exports = {
    getReviewsData,
};
