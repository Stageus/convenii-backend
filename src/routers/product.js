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

const { getProductByIdx, getProductAll, getProductsByCompanyIdx, getProductsBySearch } = require("../service/product.service");
const e = require("express");

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

        res.status(200).send({
            data: await getProductAll(user, page),
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

        res.status(200).send({
            data: await getProductsByCompanyIdx(user, companyIdx, page, option),
            authStatus: req.isLogin,
        });
    })
);

//상품 검색하기
router.get(
    "/search",
    checkAuthStatus,
    wrapper(async (req, res, next) => {
        let { keyword, categoryFilter, eventFilter, page } = req.query;
        const user = req.user;

        res.status(200).send({
            data: await getProductsBySearch(user, keyword, categoryFilter, eventFilter, page),
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

        res.status(200).send({
            data: await getProductByIdx(user, productIdx),
            authStatus: req.isLogin,
        });
    })
);
//상품 추가하기
router.post(
    "/",
    uploadImg,
    adminAuth,
    checkCondition("name"),
    checkCondition("price"),
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
router.delete(
    "/:productIdx",
    adminAuth,
    wrapper(async (req, res, next) => {
        const { productIdx } = req.params;

        await query(
            `
            UPDATE
                product
            SET
                deleted_at = current_date
            WHERE
                idx = $1
            `,
            [productIdx]
        );
        res.status(201).send();
    })
);

module.exports = router;
