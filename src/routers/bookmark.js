const router = require("express").Router();
const loginAuth = require("../middlewares/loginAuth");
const pgPool = require("../modules/pgPool");

// 북마크 등록하기
router.post("/product/:productIdx", loginAuth, async (req, res, next) => {
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

        if (bookmarkQueryData.rows.length > 0) {
            const error = new Error("이미 북마크 되어 있는 상품임");
            error.status = 401;
            throw error;
        }
        const insertSql = "INSERT INTO bookmark (account_idx, product_idx) VALUES ($1,$2)";
        await pgPool.query(insertSql, [accountIdx, productIdx]);

        res.status(201).send();
    } catch (error) {
        next(error);
    }
});

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
router.delete("/", async (req, res, next) => {
    try {

    } catch (error) {
        next(error);
    }
});

module.exports = router;
