const pgPool = require("../util/module/pgPool");
const query = require("../util/module/query");
const DeleteEventByProductIdxDao = require("./dao/delete-eventByProductIdx.dao");
const InsertEventDao = require("./dao/insert-event.dao");
const SelectEventByProductDao = require("./dao/select-eventByProduct.dao");
const EventWithMonth = require("./model/eventWithMonth.model");

const EventWithProductIdx = require("./model/eventWithProductIdx.model");

/**
 *
 * @param {SelectEventByProductDao} selectEventByProductDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<EventWithMonth[]>}
 */
const selectEventByProduct = async (selectEventByProductDao, conn = pgPool) => {
    const queryResult = await query(
        `
        --최근 10개월 불러오기
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
                json_agg(event_array.event_info) FILTER (WHERE event_array.event_info IS NOT NULL) AS "eventInfo"
            FROM
                month_array
        -- 기간을 기준으로 LEFT JOIN 하여 데이터가 null인 경우도 배열로 넣기
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
    return queryResult.rows;
};

/**
 *
 * @param {pg.PoolClient} conn
 * @returns {Promise<EventWithProductIdx>}
 */
const selectEvents = async (conn = pgPool) => {
    const queryResult = await query(
        `
            SELECT
                product_idx AS "productIdx",
                json_agg(
                    json_build_object(
                        'companyIdx', company_idx,
                        'eventIdx', event_idx,
                        'price', price
                    ) ORDER BY company_idx
                ) AS "eventInfo"
            FROM
                event_history
            WHERE
                start_date >= (date_trunc('month', current_date) - interval '1 month')
            GROUP BY
                product_idx
            ORDER BY
                product_idx
        `,
        conn
    );
    return queryResult.rows;
};

/**
 *
 * @param {DeleteEventByProductIdxDao} deleteEventByProductIdxDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<pg.QueryResult>}
 */
const deleteEvent = async (deleteEventByProductIdxDao, conn = pgPool) => {
    return await query(
        `
            DELETE
            FROM
                event_history
            WHERE
                product_idx = $1
            AND
                start_date >= date_trunc('month', current_date)
            AND
                start_date < date_trunc('month', current_date) + interval '1 month'
        `,
        [deleteEventByProductIdxDao.productIdx],
        conn
    );
};

/**
 *
 * @param {InsertEventDao} insertEventDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<pg.QueryResult>}
 */
const insertEvent = async (insertEventDao, conn = pgPool) => {
    return await query(
        `
            INSERT INTO
                event_history
                (start_date, product_idx, company_idx, event_idx, price )
            VALUES
                (current_date, $1, UNNEST($2::int[]), UNNEST($3::int[]), UNNEST($4::varchar[]))
        `,
        [insertEventDao.productIdx, insertEventDao.companyList, insertEventDao.eventList, insertEventDao.priceList],
        conn
    );
};

module.exports = {
    selectEventByProduct,
    selectEvents,
    deleteEvent,
    insertEvent,
};
