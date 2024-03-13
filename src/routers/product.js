const router = require("express").Router();
const pgPool = require("../modules/pgPool");

router.get("/test", async (req, res, next) => {
    res.status(200).send("test");
});

//모든 상품 가져오기
router.get("/all", async (req, res, next) => {
    try {
    } catch (err) {}
});
//회사 행사페이지 상품 가져오기
router.get("/company/:companyIdx", async (req, res, next) => {
    try {
    } catch (err) {}
});

//상품 검색하기
router.get("/search", async (req, res, next) => {
    const { keyword, eventFilter, categoryFilter } = req.query;
    const { accountIdx } = req.header.token;
    const result = {
        data: null,
    };
    try {
        console.log("SDFDF");
        const sql = `
            SELECT
                p.idx,
                p.name,
                p.price,
                p.image_url,
                p.score,
                p.created_at,
                COALESCE(bm.bookmarked, 0) AS bookmarked,
                json_object_agg(c.name, COALESCE(e.type, 'null')) FILTER (WHERE c.name IS NOT NULL) AS events
            FROM
                product p
            CROSS JOIN
                company c
            LEFT JOIN
                event_history eh ON eh.product_idx = p.idx AND eh.company_idx = c.idx
            LEFT JOIN
                event e ON e.idx = eh.event_idx AND eh.start_date >= date_trunc('month', current_date) AND eh.start_date < date_trunc('month', current_date) + interval '1 month'
            LEFT JOIN
                (SELECT product_idx, 1 AS bookmarked FROM bookmark WHERE account_idx = $1) bm ON bm.product_idx = p.idx
            WHERE
                p.deleted_at IS NULL
                AND p.name LIKE $2
            GROUP BY
                p.idx, bm.bookmarked
            ORDER BY
                p.name; 
        `;
        const queryResult = await pgPool.query(sql, [accountIdx, keyword, eventFilter, categoryFilter]);
        result.data = queryResult.rows;
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
});
//productIdx 가져오기
router.get("/:productIdx", async (req, res, next) => {
    const { productIdx } = req.params;
    const { accountIdx } = 3; //req.body.token;
    const result = {
        data: null,
    };

    try {
        const productSql = `
            SELECT 
                idx AS product_idx,
                name,
                price,
                image_url,
                score,
                created_at,
                CASE
                    WHEN (SELECT COUNT(*) FROM bookmark WHERE product_idx  = $1 AND account_idx = $2 ) >= 1
                    THEN 1
                    ELSE 0
                END AS bookmarked
            FROM
                product 
            WHERE idx = $1 AND deleted_at is NULL`;

        const eventSql = `
            WITH month_array AS (
                SELECT to_char(date_trunc('month', current_date) - interval '1 month' * series, 'YYYY-MM') AS month
                FROM generate_series(0, 9) AS series
            ),
            company_array AS (
                SELECT idx, name 
                FROM company
            ),
            event_array AS (
                SELECT 
                    to_char(event_history.start_date, 'YYYY-MM') AS month,
                    company.name AS company_name,
                    CASE 
                        WHEN event.type = '할인' THEN CAST(event.price AS VARCHAR)
                        ELSE event.type 
                    END AS event_type
                FROM 
                    event_history 
                JOIN 
                    event ON event_history.event_idx = event.idx
                JOIN 
                    company ON event_history.company_idx = company.idx
                WHERE 
                    event_history.product_idx = $1 AND
                    event_history.start_date >= (SELECT min(date_trunc('month', current_date) - interval '1 month' * series) FROM generate_series(0, 9) AS series)
            ),
            result AS (
                SELECT 
                    month_array.month,
                    company_array.name AS company_name,
                    COALESCE(event_array.event_type, 'null') AS event_type
                FROM 
                    month_array 
                CROSS JOIN 
                    company_array 
                LEFT JOIN 
                    event_array  ON month_array.month = event_array.month AND company_array.name = event_array.company_name
            )
            SELECT 
                month, 
                json_object_agg(company_name, event_type) AS events
            FROM 
                result
            GROUP BY 
                month
            ORDER BY 
                month DESC   
            `;
        const productQueryResult = await pgPool.query(productSql, [productIdx, accountIdx]);
        const eventQueryResult = await pgPool.query(eventSql, [productIdx]);

        if (productQueryResult.rows.length == 0) {
            throw new Error();
        }
        result.data = productQueryResult.rows[0];
        result.data.eventsInfo = [];

        eventQueryResult.rows.forEach((eventRow) => {
            result.data.eventsInfo.push({
                month: eventRow.month,
                events: eventRow.events,
            });
        });

        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
});
//상품 추가하기
router.post("/", async (req, res, next) => {
    const { category, name, price, imageUrl, eventInfo } = req.body;

    const client = await pgPool.connect();

    try {
        await client.query("BEGIN");

        const productSql = `
            INSERT INTO product (category_idx, name, price, image_url)
            VALUES (
                (SELECT idx FROM category WHERE name = $1),
                $2,
                $3,
                $4
            )
            RETURNING idx
        `;
        const productQueryResult = await client.query(productSql, [category, name, price, imageUrl]);
        const productIdx = productQueryResult.rows[0].idx;
        eventInfo.forEach();

        await client.query("COMMIT");
        res.status(201).send();
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    }
});

// productIdx 수정하기
router.put("/:productIdx", async (req, res, next) => {
    try {
    } catch (err) {}
});

//productIdx 삭제하기
router.delete("/:productIdx", async (req, res, next) => {
    try {
    } catch (err) {}
});
module.exports = router;
