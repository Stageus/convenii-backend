const query = require("../modules/query");
const pgPool = require("../modules/pgPool");
/**
 *
 * @param {number} productIdx
 * @param {PoolClient} conn
 * @returns {Promise<QueryResult>}
 */
const deleteCurrentMonthEventsByProductIdx = async (productIdx, conn) => {
    return await query(
        `
            DELETE
            FROM
                event_history
            WHERE
                product_idx = $1
                AND start_date >= date_trunc('month', current_date)
                AND start_date < date_trunc('month', current_date) + interval '1 month'                
        `,
        [productIdx],
        conn
    );
};

const insertEventsByProductIdx = async (productIdx, companyIdxArray, eventIdxArray, eventPriceArray, conn) => {
    return await query(
        `
            INSERT INTO event_history
                (start_date, product_idx, company_idx, event_idx, price )
            VALUES
                (current_date, $1, UNNEST($2::int[]), UNNEST($3::int[]), UNNEST($4::varchar[]))
            `,
        [productIdx, companyIdxArray, eventIdxArray, eventPriceArray],
        conn
    );
};
module.exports = {
    deleteCurrentMonthEventsByProductIdx,
    insertEventsByProductIdx,
};
