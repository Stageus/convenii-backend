const pgPool = require("../util/module/pgPool");
const query = require("../util/module/query");

/**
 *
 * @param {SelectEventByProductDao} selectEventByProductDao
 * @param {} conn
 * @returns
 */
const selectEventByProduct = async (selectEventByProductDao, conn = pgPool) => {
    const queryResult = await query(
        `
            WITH month_array AS (
                SELECT to_char(date_trunc('month', current_date) - interval '1 month' * series, 'YYYY-MM') AS month
                FROM generate_series(0, 9) AS series
            ),
            event_array AS (
                SELECT
                    json_build_object(
                        'companyIdx', company_idx,
                        'eventIdx', event_idx,
                        'price', price
                    ) AS event_info,
                    to_char(start_date, 'YYYY-MM') AS event_month
                FROM
                    event_history
                WHERE
                    product_idx = 35
                AND
                    start_date >= (date_trunc('month', current_date) - interval '9 months')
                ORDER BY
                    company_idx DESC
            )
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
        `,
        [selectEventByProductDao.productIdx],
        conn
    );
    return queryResult.rows[0];
};

/**
 *
 * @param {SelectEventsDao} selectEventsDao
 * @param {*} conn
 * @returns
 */
const selectEvents = async (selectEventsDao, conn = pgPool) => {
    const queryResult = await query(
        `
        SELECT
            product_idx,
            json_agg(
                json_build_object(
                    'companyIdx', company_idx,
                    'eventIdx', event_idx,
                    'price', price
                )
            ) AS eventInfo
        FROM
            event_history
        WHERE
            start_date >= (date_trunc('month', current_date) - interval '1 month')
        GROUP BY
            product_idx
        ORDER BY
            product_idx;
                company_idx DESC;


        `,
        conn
    );
    return queryResult.rows;
};
/*
추가해야할 파일
1.SelectEventByProductDao
2.SelecctEventsDao
*/
