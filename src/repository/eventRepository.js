const query = require("../modules/query");
const pgPool = require("../modules/pgPool");
const EventHistoryDataDto = require("../dto/eventDto/EventHistoryDataDto");
const { NotFoundException } = require("../modules/Exception");
const PostEventsDataDto = require("../dto/eventDto/PostEventsDataDto");

/**
 *
 * @param {number} productIdx
 * @param {pg.PoolClient} conn
 * @returns {Promise<Array<{
 *      month: string,
 *      events: Event,
 *     }>>
 * }
 * @throws {NotFoundException}
 */
const getEventHistoryData = async (productIdx, conn = pgPool) => {
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
        [productIdx],
        conn
    );
    if (!eventInfoSelectResult.rows.length) {
        throw new NotFoundException("Cannot find product's eventHistory ");
    }
    return new EventHistoryDataDto(eventInfoSelectResult.rows);
};

/**
 *
 * @param {number} productIdx
 * @param {PoolClient} conn
 * @returns {Promise<QueryResult>}
 */
const deleteCurrentMonthEventsByProductIdx = async (productIdx, conn = pgPool) => {
    console.log(productIdx);
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

/**
 *
 * @param {PostEventsDataDto} postEventsDataDto
 * @param {PoolClient} conn
 * @returns {Promise<QueryResult>}
 */
const postEventsDataByProductIdx = async (postEventsDataDto, conn = pgPool) => {
    return await query(
        `
            INSERT INTO event_history
                (start_date, product_idx, company_idx, event_idx, price )
            VALUES
                (current_date, $1, UNNEST($2::int[]), UNNEST($3::int[]), UNNEST($4::varchar[]))
            `,
        postEventsDataDto.toParams(),
        conn
    );
};
module.exports = {
    getEventHistoryData,
    deleteCurrentMonthEventsByProductIdx,
    postEventsDataByProductIdx,
};
