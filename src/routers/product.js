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
const e = require("express");
const COMPANY_SIZE = 3;
const keywordPattern = /^(null|[d가-힣A-Za-z]{0,30})$/;
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
            throw new BadRequestException("companyIdx 입력 오류");
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
router.get(
    "/search",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        let { keyword, eventFilter, categoryFilter, page } = req.query;
        const user = req.user;
        const pageSizeOption = 10;
        if (!keywordPattern.test(keyword)) {
            throw new BadRequestException("keyword 입력 오류");
        }
        if (!page || isNaN(parseInt(page, 10)) || page <= 0) {
            throw new BadRequestException("page 입력 오류");
        }
        if (!eventFilter) {
            eventFilter = [1, 2, 3, 4, 5, 6];
        }
        if (!categoryFilter) {
            categoryFilter = [1, 2, 3, 4, 5, 6];
        }
        //검색어 필터링 sql
        const sql = `
            --해당 이벤트가 존재하는 product_idx 가져오기
            WITH possilbe_product AS (
                SELECT
                    DISTINCT event_history.product_idx AS idx
                FROM
                    event_history
                WHERE
                    event_history.event_idx = ANY($4)
                    AND
                        event_history.start_date >= date_trunc('month', current_date)
                    AND
                        event_history.start_date < date_trunc('month', current_date) + interval '1 month'
            )
            SELECT
                product.idx,
                product.category_idx,
                product.name,
                product.price,
                product.image_url,
                product.score,
                product.created_at,
                --북마크 여부
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
                -- 이벤트 정보
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
            LEFT JOIN
                possilbe_product
            ON
                product.idx = possilbe_product.idx
            WHERE
                product.deleted_at IS NULL
            AND
                product.name LIKE $2
            AND
                product.category_idx = ANY($3)
            AND
                possilbe_product.idx IS NOT NULL
            ORDER BY
                product.name
            LIMIT $5 OFFSET $6
            `;

        const products = await query(sql, [user.idx, "%" + keyword + "%", categoryFilter, eventFilter, pageSizeOption, (parseInt(page) - 1) * pageSizeOption]);

        res.status(200).send({
            data: products.rows,
            authStatus: req.isLogin,
        });
    })
);

//productIdx 가져오기
router.get(
    "/:productIdx",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        const { productIdx } = req.params;
        const user = req.user;

        const product = await query(
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
                ) IS NOT NULL AS "bookmarked"
            FROM    
                product
            WHERE
                product.deleted_at IS NULL
            AND
                product.idx = $2
            `,
            [user.idx, productIdx]
        );

        const eventInfo = await query(
            `
             WITH month_array AS (
                SELECT to_char(date_trunc('month', current_date) - interval '1 month' * series, 'YYYY-MM') AS month
                FROM generate_series(0, 9) AS series
            ),
            event_array AS (
                SELECT
                    json_build_object(
                        'companyIdx', event_history.company_idx,
                        'eventType', event_history.event_idx,
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

        if (product.rows.length == 0) {
            throw new BadRequestException("올바르지 않은 productIdx: idx가 없음");
        }
        if (eventInfo.rows.length == 0) {
            throw new BadRequestException("올바르지 않은 productIdx: eventInfo가 없음");
        }

        res.status(200).send({
            data: {
                product: product.rows[0],
                history: eventInfo.rows,
            },
            authStatus: req.isLogin,
        });
    })
);
//상품 추가하기
router.post(
    "/",
    uploadImg,
    adminAuth,
    wrapper(async (req, res, next) => {
        const { categoryIdx, name, price, eventInfo } = req.body;
        const imageUrl = req.file.location;
        const client = await pgPool.connect();
        const companyIdxArray = [];
        const eventIdxArray = [];
        const eventPriceArray = [];

        eventInfo.forEach((event) => {
            //companyIdx가 없으면 넣지 않는다
            if (event.companyIdx && event.companyIdx > 0 && event.companyIdx <= COMPANY_SIZE) {
                companyIdxArray.push(event.companyIdx);
                eventIdxArray.push(event.eventIdx);
                if (!event.eventPrice) {
                    event.eventPrice = null;
                }
                eventPriceArray.push(event.eventPrice);
            }
        });

        try {
            await client.query("BEGIN");
            const newProduct = await client.query(
                `
                INSERT INTO product (category_idx, name, price, image_url)
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4
                )
                RETURNING idx
            `,
                [categoryIdx, name, price, imageUrl]
            );
            const productIdx = newProduct.rows[0].idx;

            await client.query(
                `
                INSERT INTO event_history
                    (start_date, product_idx, company_idx, event_idx, price )
                VALUES
                    (current_date, $1, UNNEST($2::int[]), UNNEST($3::int[]), UNNEST($4::varchar[]))
                `,
                [productIdx, companyIdxArray, eventIdxArray, eventPriceArray]
            );

            await client.query("COMMIT");
            res.status(201).send();
        } catch (err) {
            await client.query("ROLLBACK");
            next(err);
        } finally {
            await client.release();
        }
    })
);

// productIdx 수정하기
router.put(
    "/:productIdx",
    uploadImg,
    adminAuth,
    wrapper(async (req, res, next) => {
        const { categoryIdx, name, price, eventInfo } = req.body;
        const { productIdx } = req.params;

        const client = await pgPool.connect();
        const companyIdxArray = [];
        const eventIdxArray = [];
        const eventPriceArray = [];
        eventInfo.forEach((event) => {
            //companyIdx가 없으면 넣지 않는다
            if (event.companyIdx && event.companyIdx > 0 && event.companyIdx <= COMPANY_SIZE) {
                companyIdxArray.push(event.companyIdx);
                eventIdxArray.push(event.eventIdx);
                if (!event.eventPrice) {
                    event.eventPrice = null;
                }
                eventPriceArray.push(event.eventPrice);
            }
        });
        const imageUrl = req.file ? req.file.location : null;
        const updateParams = [categoryIdx, name, price, productIdx];
        if (req.file) {
            updateParams.push(imageUrl);
        }
        try {
            await client.query("BEGIN");
            // product 존재 여부 확인
            const productExistenceCheck = await client.query(
                `
                SELECT idx
                FROM product
                WHERE idx = $1
                `,
                [productIdx]
            );

            // 존재하지 않는 productIdx인 경우
            if (productExistenceCheck.rows.length === 0) {
                throw new BadRequestException("productIdx에 해당하는 product가 없음");
            }
            // product update
            await client.query(
                `
                UPDATE
                    product
                SET
                    category_idx = $1,
                    name = $2,
                    price = $3
                    ${imageUrl ? ", image_url = $5" : ""}
                WHERE
                    idx = $4            
                `,
                updateParams
            );

            // 헹사 update (깉은 월 행사 삭제)
            await client.query(
                `
                DELETE
                FROM
                    event_history
                WHERE
                    product_idx = $1
                    AND start_date >= date_trunc('month', current_date)
                    AND start_date < date_trunc('month', current_date) + interval '1 month'                
                `,
                [productIdx]
            );

            // 행사 삽입
            await client.query(
                `
                INSERT INTO event_history
                    (start_date, product_idx, company_idx, event_idx, price )
                VALUES
                    (current_date, $1, UNNEST($2::int[]), UNNEST($3::int[]), UNNEST($4::varchar[]))
                `,
                [productIdx, companyIdxArray, eventIdxArray, eventPriceArray]
            );

            await client.query("COMMIT");
            res.status(201).send();
        } catch (err) {
            await client.query("ROLLBACK");
            next(err);
        } finally {
            client.release();
        }
    })
);

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
