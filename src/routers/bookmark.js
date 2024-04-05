const router = require("express").Router();
const loginAuth = require("../middlewares/loginAuth");
const pgPool = require("../modules/pgPool");
const wrapper = require("../modules/wrapper");
const query = require("../modules/query");
const { Exception, NotFoundException, BadRequestException, ForbiddenException } = require("../modules/Exception");

// 북마크 등록하기
router.post(
    "/product/:productIdx",
    loginAuth,
    wrapper(async (req, res, next) => {
        const { productIdx } = req.params;
        const user = req.user;

        const product = await query(
            `
            SELECT
                *
            FROM
                product
            WHERE
                idx = $1
            `,
            [productIdx]
        );
        if (product.rows.length === 0) {
            throw new BadRequestException("존재하지 않는 상품임");
        }

        const bookmarkData = await query(
            `
            SELECT
             *
            FROM
                bookmark
            WHERE
                account_idx=$1
            AND
                product_idx=$2
            `,
            [user.idx, productIdx]
        );
        if (bookmarkData.rows.length > 0) {
            throw new UnauthorizedException("이미 북마크 되어 있는 상품임");
        }

        await query(
            `
            INSERT INTO
                bookmark
                (account_idx, product_idx)
            VALUES
                ($1,$2)
            `,
            [user.idx, productIdx]
        );

        res.status(201).send();
    })
);

// 북마크 가져오기
router.get(
    "/all",
    loginAuth,
    wrapper(async (req, res, next) => {
        const user = req.user;
        const { page } = req.query;
        const pageSizeOption = 10;

        if (!page || isNaN(parseInt(page, 10)) || page <= 0) {
            throw new BadRequestException("page 입력 오류");
        }

        const products = await query(
            `
            --북마크한 product_idx
            WITH possilbe_product AS (
                SELECT
                    DISTINCT bookmark.product_idx AS idx
                FROM
                    bookmark
                WHERE
                    account_idx = $1
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
                possilbe_product.idx IS NOT NULL
            ORDER BY
                product.name
            LIMIT $2 OFFSET $3            
            `,
            [user.idx, pageSizeOption, (parseInt(page) - 1) * pageSizeOption]
        );

        res.status(200).send({
            data: products,
        });
    })
);

// 북마크 삭제하기
router.delete(
    "/product/:productIdx",
    loginAuth,
    wrapper(async (req, res, next) => {
        const { productIdx } = req.params;
        const user = req.user;

        const product = await query(
            `
            SELECT
                *
            FROM
                product
            WHERE
                idx = $1
            `,
            [productIdx]
        );
        if (product.rows.length === 0) {
            throw new BadRequestException("존재하지 않는 상품임");
        }

        const bookmarkCheck = await query(
            `
            SELECT
                *
            FROM
                bookmark
            WHERE
                account_idx=$1
            AND
                product_idx=$2
            `,
            [user.idx, productIdx]
        );
        if (bookmarkCheck.rows.length === 0) {
            throw new UnauthorizedException("북마크 되어 있지 않은 상품임");
        }

        await query(
            `
            DELETE
            FROM
                bookmark
            WHERE
                account_idx=$1
            AND
                product_idx=$2
        `,
            [user.idx, productIdx]
        );

        res.status(201).send();
    })
);

module.exports = router;
