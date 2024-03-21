const router = require("express").Router();
const loginAuth = require("../middlewares/loginAuth");
const pgPool = require("../modules/pgPool");

// 북마크 등록하기
router.post("/product/:productIdx", loginAuth, async (req, res, next) => {
    const { productIdx } = req.params;
    const idx = req.user.idx;
    try {
        const productSql = 'SELECT * FROM product WHERE idx = $1';
        const productQueryData = await pool.query(productSql, [productIdx]);
        if (productQueryData.rows.length === 0) {
            const error = new Error("존재하지 않는 상품임");
            error.status = 400;
            throw error;
        }

        const insertSql = `
            INSERT INTO bookmark (account_idx, product_idx) 
            VALUES ($1,$2)
            ON CONFLICT (product_idx) DO NOTHING`;
        const insertQueryData = await pgPool.query(insertSql, [idx, productIdx]);

        if (insertQueryData.rows.length == 0) {
            const error = new Error("이미 북마크 되어 있는 상품임");
            error.status = 401;
            throw error;
        }

        res.status(201).send();
    } catch (error) {
        next(error);
    }
});

// 북마크 가져오기
router.get("/all", async (req, res, next) => {
    try {
        const result = {
            data: null,
        };
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
