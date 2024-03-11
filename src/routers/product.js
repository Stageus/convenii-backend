const router = require("express").Router();

//productIdx 가져오기
router.get("/:productIdx", async (req, res, next) => {
    const { productIdx } = req.params;
    const { company_infocountIdx } = a;
    const result = {
        data: null,
    };

    try {
        const productSql = `SELECT 
                                idx AS product_idx,
                                name,
                                price,
                                image_url,
                                score,
                                created_at,
                                CASE
                                    WHEN (SELECT COUNT(*) FROM bookmark WHERE product_idx  = $1 AND company_infocount_idx = $2 ) >= 1
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
                to_char(eh.start_date, 'YYYY-MM') AS month,
                company.name AS company_name,
                event.type AS event_type
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
        const productQueryResult = await pgPool.query(productSql, [productIdx, company_infocountIdx]);
        const eventQueryResult = await pgPool.query(eventSql, [productIdx]);
    } catch (err) {}
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
router.get("/company/search", async (req, res, next) => {
    try {
    } catch (err) {}
});

//상품 추가하기
router.post("/", async (req, res, next) => {
    try {
    } catch (err) {}
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
