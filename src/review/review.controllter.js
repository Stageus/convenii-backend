const router = require("express").Router();

const wrapper = require("../util/module/wrapper");
const accountAuth = require("../util/middleware/accountAuth");

/////////////-------review---------////////////////////
//  POST/product/:productIdx        => 리뷰 추가하기
//  GET/product/:productIdx         =>  모든 리뷰 가져오기
/////////////////////////////////////////////////////

//productIdx의 리뷰 추가하기
router.post(
    "/product/:productIdx",
    checkCondition("score"),
    checkCondition("content"),
    accountAuth(1),
    wrapper(async (req, res, next) => {
        const { score, content } = req.body;
        const { productIdx } = req.params;
        const accountIdx = req.user.idx;

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
            const reviewQueryResult = await client.query(reviewSql, [productIdx, accountIdx, content, score]);
            const scoreQueryResult = await client.query(scoreSql, [productIdx]);
            if (reviewQueryResult.rowCount === 0) {
                throw new BadRequestException("insert review fail");
            }
            if (scoreQueryResult.rowCount === 0) {
                throw new UnauthorizedException("update score fail");
            }
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

//productIdx의 모든 리뷰 가져오기
router.get(
    "/product/:productIdx",
    accountAuth(),
    wrapper(async (req, res, next) => {
        const { productIdx } = req.params;
        const { page } = req.query;
        const pageSizeOption = 10;

        if (!page || isNaN(parseInt(page, 10)) || page <= 0) {
            throw new BadRequestException("page 입력 오류");
        }

        const reviews = await query(
            `
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
            `,
            [productIdx, pageSizeOption, (parseInt(page) - 1) * pageSizeOption]
        );

        res.status(200).send({
            data: reviews.rows,
            authStatus: req.isLogin,
        });
    })
);

module.exports = router;
