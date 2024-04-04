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
router.get("/all", loginAuth, async (req, res, next) => {
    const accountIdx = req.user.idx;
    const result = {
        data: null,
    };
    try {
        const sql = `
            SELECT
                p.idx,
                p.category_idx,
                p.name,
                p.price,
                p.image_url,
                p.score
            FROM 
                product p
            INNER JOIN
                bookmark b ON p.idx = b.product_idx
            WHERE 
                b.account_idx = $1
                AND
                p.deleted_at IS NULL
        `;
        const queryData = await pgPool.query(sql, [accountIdx]);
        result.data = queryData.rows;

        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
});

// 북마크 삭제하기
router.delete("/product/:productIdx", loginAuth, async (req, res, next) => {
    const { productIdx } = req.params;
    const accountIdx = req.user.idx;
    try {
        const prodcutExistingSql = "SELECT * FROM product WHERE idx = $1";
        const productQueryData = await pgPool.query(prodcutExistingSql, [productIdx]);
        if (productQueryData.rows.length === 0) {
            const error = new Error("존재하지 않는 상품임");
            error.status = 400;
            throw error;
        }

        const bookmarkExistingSql = "SELECT * FROM bookmark WHERE account_idx=$1 AND product_idx=$2";
        const bookmarkQueryData = await pgPool.query(bookmarkExistingSql, [accountIdx, productIdx]);
        if (bookmarkQueryData.rows.length === 0) {
            const error = new Error("북마크 되어 있지 않은 상품임");
            error.status = 401;
            throw error;
        }

        const deleteSql = "DELETE FROM bookmark WHERE account_idx=$1 AND product_idx=$2";
        await pgPool.query(deleteSql, [accountIdx, productIdx]);

        res.status(201).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;
