const Account = require("../entity/Account");
const Product = require("../entity/Product");
const query = require("../modules/query");

/**
 *
 * @param {number} userIdx
 * @param {number} productIdx
 * @returns {Promise<{
 *  idx: number;
 *  categoryIdx: number;
 *  name: string;
 *  price: string;
 *  productImg: string;
 *  score: number;
 *  createdAt: Date;
 *  bookmarked: boolean;
 * }>}
 */
const getProductData = async (userIdx, productIdx) => {
    const productSelectResult = await query(
        `SELECT
            product.idx,
            product.category_idx AS "categoryIdx",
            category.name AS "categoryName",
            product.name,
            product.price,
            product.image_url AS "productImg",
            product.score,
            product.created_at AS "createdAt",
            (
                SELECT
                    bookmark.idx
                FROM
                    bookmark
                WHERE
                    account_idx = $1
                AND
                    product_idx = product.idx
            ) IS NOT NULL AS "bookmarked"
        FROM    
            product
        JOIN
            category
        ON
            product.category_idx = category.idx
        WHERE
            product.deleted_at IS NULL
        AND
            product.idx = $2`,
        [userIdx, productIdx]
    );
    return productSelectResult.rows[0];
};

/**
 *
 * @param {number} productIdx
 * @returns {Promise<Array<{
 *      month: Date,
 *      events: Array<{
 *          companyIdx: number,
 *          eventIdx: number,
 *          price: string | null
 *      }>
 *     }>>
 *
 * }
 */
const getEventHistoryData = async (productIdx) => {
    const eventInfoSelectResult = await query(
        `
                WITH month_array AS (
                SELECT to_char(date_trunc('month', current_date) - interval '1 month' * series, 'YYYY-MM') AS month
                FROM generate_series(0, 9) AS series
            ),
            event_array AS (
                SELECT
                    json_build_object(
                        'companyIdx', event_history.company_idx,
                        'eventIdx', event_history.event_idx,
                        'price', event_history.price
                    ) AS event_info,
                    to_char(event_history.start_date, 'YYYY-MM') AS event_month
                FROM
                    event_history
                WHERE
                    event_history.product_idx = $1
                    AND event_history.start_date >= (date_trunc('month', current_date) - interval '9 months')
            ),
            merge_events AS (
                SELECT
                    month_array.month,
                    json_agg(event_array.event_info) FILTER (WHERE event_array.event_info IS NOT NULL) AS events
                FROM
                    month_array
                LEFT JOIN
                    event_array ON month_array.month = event_array.event_month
                GROUP BY
                    month_array.month
                ORDER BY
                    month_array.month DESC
            )
            SELECT 
                month,
                events
            FROM 
                merge_events       
            `,
        [productIdx]
    );
    return eventInfoSelectResult.rows;
};

module.exports = { getProductData, getEventHistoryData };
