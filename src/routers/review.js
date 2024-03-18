const router = require("express").Router();
const pgPool = require("../modules/pgPool");
//productIdx의 리뷰 추가하기
router.post("/product/:productIdx", async (req, res, next) => {
    const { score, content } = req.body;
    const { productIdx } = req.params;
    const token = req.headers.authorization;
    const { accountIdx } = 3; //req.body.token;

    const client = await pgPool.connect();
    try {
        await client.query("BEGIN");

        const reviewSql = `
            INSERT INTO
                review (product_idx, account_idx, content, score)
            VALUES
                ($1,$2,$3,$4)`;
        const scoreSql = `
            UPDATE product SET score = (
                SELECT
                    AVG (score)
                FROM
                    review
                WHERE
                    product_idx = $1 
            )
            WHERE idx = $1
        `;
        await client.query(reviewSql, [productIdx, accountIdx, content, score]);
        await client.query(scoreSql, [productIdx]);

        await client.query("COMMIT");
        res.status(201).send();
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    }
});

//productIdx의 모든 리뷰 가져오기
router.get("/product/:productIdx", async (req, res, next) => {
    const { productIdx } = req.params;
    const { page } = req.query;
    const pageSizeOption = 10;
    const result = {
        data: null,
    };
    try {
        const sql = `
            SELECT
                r.idx, r.product_idx, a.nickname, r.content, r.score, r.created_at
            FROM
                review r
            JOIN
                account a ON a.idx = r.account_idx
            WHERE
                r.product_idx = $1
            ORDER BY r.idx DESC
            LIMIT $2 OFFSET $3
        `;
        const queryResult = await pgPool.query(sql, [productIdx, pageSizeOption, (parseInt(page) - 1) * pageSizeOption]);

        result.data = queryResult.rows;
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
