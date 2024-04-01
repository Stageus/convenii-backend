const router = require("express").Router();

const pgPool = require("../modules/pgPool");
const checkCondition = require("../middlewares/checkCondition");
const loginAuth = require("../middlewares/loginAuth");
const adminAuth = require("../middlewares/adminAuth");
const checkAuthStatus = require("../middlewares/checkAuthStatus");
const uploadImg = require("../middlewares/uploadImg");
const wrapper = require("../modules/wrapper");
const query = require("../modules/query");
const { Exception, NotFoundException, BadRequestException, ForbiddenException } = require("../modules/Exception");
const COMPANY_SIZE = 3;
/////////////---------------product---------/////////////////////
//  GET/all                       => 모든 상품 가져오기
//  GET/company/:companyIdx       => 회사별로 행사 정렬해서 가져오기
//  GET/search                    => 상품 검색
//  GET//:productIdx              =>비밀번호 찾기
//  POST/                          => 상품 추가하기
//  PUT/                           => 상품 정보 수정
//  DELETE/                        => 상품 삭제
/////////////////////////////////////////

//모든 상품 가져오기
router.get(
    "/all",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        const user = req.user;
        const { page } = req.query;
        const pageSizeOption = 10;

        if (!page || isNaN(parseInt(page, 10)) || page <= 0) {
            throw new BadRequestException("page 입력 오류");
        }
        const products = await query(
            `
            SELECT
                product.idx,
                product.category_idx,
                product.name,
                product.price,
                product.image_url,
                product.score,
                product.created_at,
                (
                    SELECT
                        bookmark.idx
                    FROM
                        bookmark
                    WHERE
                        account_idx = $1
                    AND
                        product_idx = product.idx
                ) IS NOT NULL AS "bookmarked",
                ARRAY (
                    SELECT
                        json_build_object(
                            'companyIdx', event_history.company_idx,
                            'eventType', event_history.event_idx,
                            'price', price
                        )
                    FROM
                        event_history
                    WHERE
                        event_history.product_idx = product.idx
                    AND
                        event_history.start_date >= date_trunc('month', current_date)
                    AND
                        event_history.start_date < date_trunc('month', current_date) + interval '1 month'
                    ORDER BY
                        event_history.company_idx
                ) AS eventInfo
            FROM    
                product
            WHERE
                product.deleted_at IS NULL
            ORDER BY
                product.name
            LIMIT $2 OFFSET $3
            `,
            [user.idx, pageSizeOption, (parseInt(page) - 1) * pageSizeOption]
        );

        res.status(200).send({
            data: products.rows,
            authStatus: req.isLogin,
        });
    })
);

//회사 행사페이지 상품 가져오기
router.get(
    "/company/:companyIdx",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        const { companyIdx } = req.params;
        const { page, option } = req.query;
        const user = req.user;
        let pageSizeOption = 10;
        let offset = (parseInt(page) - 1) * pageSizeOption;
        if (!companyIdx || isNaN(parseInt(companyIdx, 10)) || companyIdx <= 0 || companyIdx > COMPANY_SIZE) {
            throw new BadRequestException("companyIㄴdx 입력 오류");
        }
        if (!page || isNaN(parseInt(page, 10)) || page <= 0) {
            throw new BadRequestException("page 입력 오류");
        }
        if (option !== "main" && option !== "all") {
            throw new BadRequestException("option 입력 오류");
        }
        if (option === "main") {
            pageSizeOption = 3;
            offset = 0;
        }

        const products = await query(
            `
            WITH productInfo AS (
                SELECT
                    product.idx,
                    product.category_idx,
                    product.name,
                    product.price,
                    product.image_url,
                    product.score,
                    product.created_at,
                    (
                        SELECT
                            bookmark.idx
                        FROM
                            bookmark
                        WHERE
                            account_idx = $1
                        AND
                            product_idx = product.idx
                    ) IS NOT NULL AS "bookmarked",
                    ARRAY (
                        SELECT
                            json_build_object(
                                'companyIdx', event_history.company_idx,
                                'eventType', event_history.event_idx,
                                'price', price
                            )
                        FROM
                            event_history
                        WHERE
                            event_history.product_idx = product.idx
                        AND
                            event_history.start_date >= date_trunc('month', current_date)
                        AND
                            event_history.start_date < date_trunc('month', current_date) + interval '1 month'
                        ORDER BY
                            event_history.company_idx
                    ) AS eventInfo,
                    (
                        SELECT
                            SUM(
                            CASE
                                    WHEN event_history.company_idx = $2 THEN event.priority * ${COMPANY_SIZE - 1}
                                    ELSE -event.priority
                                END
                            )   
                        FROM
                            event_history
                        JOIN 
                            event ON event_history.event_idx = event.idx
                        WHERE          
                            event_history.product_idx = product.idx 
                        AND
                            event_history.start_date >= date_trunc('month', current_date)
                        AND
                            event_history.start_date < date_trunc('month', current_date) + interval '1 month'
                        GROUP BY
                            event_history.product_idx
                    ) AS priorityScore
                FROM    
                    product
                WHERE
                    product.deleted_at IS NULL
            )
            SELECT * FROM productInfo
            WHERE priorityScore >= 0
            ORDER BY priorityScore DESC, name
            LIMIT $3 OFFSET $4;
            `,
            [user.idx, companyIdx, pageSizeOption, offset]
        );
        res.status(200).send({
            data: products.rows,
            authStatus: req.isLogin,
        });
    })
);

//상품 검색하기
router.get("/search", checkAuthStatus, async (req, res, next) => {
    const { keyword, eventFilter, categoryFilter } = req.query;
    const accountIdx = req.user.idx;
    const result = {
        data: null,
    };
    try {
        //검색어 필터링 sql
        const sql = `
            SELECT
                p.idx,
                p.category_idx,
                p.name,
                p.price,
                p.image_url,
                p.score,
                p.created_at,
                COALESCE(bm.bookmarked, 0) AS bookmarked,
                json_object_agg(c.name, COALESCE(CASE WHEN e.type = '할인' THEN event_history.price::text ELSE e.type END, 'null')) FILTER (WHERE c.name IS NOT NULL) AS events
            FROM
                product p
            CROSS JOIN
                company c
            LEFT JOIN
                event_history ON event_history.product_idx = p.idx AND event_history.company_idx = c.idx
            LEFT JOIN
                event e ON e.idx = event_history.event_idx
                AND event_history.start_date >= date_trunc('month', current_date)
                AND event_history.start_date < date_trunc('month', current_date) + interval '1 month'
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
        const catgegorySql = `SELECT idx FROM category WHERE name = ANY($1)`;
        const queryResult = await pgPool.query(sql, [accountIdx, "%" + keyword + "%"]);
        const categoryResult = await pgPool.query(catgegorySql, [categoryFilter]);

        result.data = [];

        //필터링 후처리

        for (let row = 0; row < queryResult.rows.length; row++) {
            const productRow = queryResult.rows[row];
            let canPush = 0;

            //카테고리 필터
            if (categoryResult.rows.length) {
                for (let i = 0; i < categoryResult.rows.length; i++) {
                    if (categoryResult.rows[i].idx === productRow.category_idx) {
                        canPush = 1;
                        break;
                    }
                }
            } else {
                canPush = 1;
            }

            if (canPush === 0) {
                continue;
            }
            canPush = 1;
            //이벤트 필터
            if (eventFilter.length) {
                for (let i = 0; i < eventFilter; i++) {
                    if (canPush === 1) {
                        break;
                    }

                    for (let companyIdx = 0; companyIdx < productRow.event.length; companyIdx++) {
                        if (eventFilter[i] === productRow.event[companyIdx]) {
                            canPush = 1;
                            break;
                        }
                    }
                }
            } else {
                canPush = 1;
            }
            if (canPush === 0) {
                continue;
            }

            result.data.push(productRow);
        }
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
});

//productIdx 가져오기
router.get("/:productIdx", async (req, res, next) => {
    const { productIdx } = req.params;
    const accountIdx = req.user.idx;
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
                        WHEN event.type = '할인' THEN CAST(event_history.price AS VARCHAR)
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
                ORDER BY month_array.month, company_name
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
router.post("/", uploadImg, adminAuth, async (req, res, next) => {
    const { category, name, price, eventInfo } = req.body;
    const imageUrl = req.file.location;
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
        const eventSql = `INSERT INTO event_history (company_idx, product_idx, event_idx, start_date, price)
                          VALUES (
                            (SELECT idx FROM company WHERE name = $1),
                            $2,
                            (SELECT idx FROM event WHERE type = $3),
                            $4,
                            $5
                          )
        `;
        const today = new Date();

        for (let idx = 0; idx < eventInfo.length; idx++) {
            const { companyName, eventType, price } = eventRow;
            await client.query(eventSql, [companyName, productIdx, eventType, today, price]);
        }

        await client.query("COMMIT");
        console.log(imageUrl);
        console.log(eventInfo);
        res.status(201).send();
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    }
});

// productIdx 수정하기
router.put("/:productIdx", adminAuth, async (req, res, next) => {
    const { category, name, price, imageUrl, eventInfo } = req.body;
    const { productIdx } = req.params;

    const client = await pgPool.connect();

    try {
        await client.query("BEGIN");
        const updateSql = `
                UPDATE
                    product
                SET
                    category_idx = (
                        SELECT idx FROM category WHERE name = $1
                    ),
                    name = $2,
                    price = $3,
                    image_url = $4
                WHERE
                    idx = $5`;
        const deleteCurrentEventSql = `
                DELETE
                FROM
                    event_history
                WHERE
                    product_idx = $1
                    AND start_date >= date_trunc('month', current_date)
                    AND start_date < date_trunc('month', current_date) + interval '1 month'
        `;
        const eventSql = `INSERT INTO event_history (company_idx, product_idx, event_idx, start_date, price)
                          VALUES (
                            (SELECT idx FROM company WHERE name = $1),
                            $2,
                            (SELECT idx FROM event WHERE type = $3),
                            current_date,
                            $4
                          )
        `;

        await client.query(updateSql, [category, name, price, imageUrl, eventInfo]);
        await client.query(deleteCurrentEventSql, [productIdx]);
        eventInfo.forEach(async (eventRow) => {
            const { companyName, eventType, price } = eventRow;
            await client.query(eventSql, [companyName, productIdx, eventType, price]);
        });

        await client.query("COMMIT");
        res.status(201).send();
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    }
});

//productIdx 삭제하기
router.delete("/:productIdx", adminAuth, async (req, res, next) => {
    const { productIdx } = req.params;
    try {
        const today = new Date();
        const sql = `
                UPDATE
                    product
                SET
                    deleted_at = $1
                WHERE
                    idx = $2`;
        await pgPool.query(sql, [today, productIdx]);
        res.status(201).send();
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    }
});
module.exports = router;
