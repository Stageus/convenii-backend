const pgPool = require("../../src/util/module/pgPool");
const { NotFoundException } = require("../util/module/Exception");
const query = require("../util/module/query");
const Product = require("./dao/product.dao");
const SelectProductsAllDao = require("./dao/select-productsAll.dao");
const GetProductsByCompanyDto = require("./dto/GetProductsByCompanyDto");
const GetProductsBySearchDto = require("./dto/GetProductsBySearchDto");
const GetProductsDto = require("./dto/GetProductsDto");
const pageSizeOption = process.env.PAGE_SIZE_OPTION;

/**
 *
 * @param {SelectProductsAllDao} selectProductsAllDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<Product[]|null}
 */
const selectProducts = async (selectProductsAllDao, conn = pgPool) => {
    const queryResult = await query(
        `
            --해당 이벤트가 존재하는 product_idx 가져오기
            WITH possible_product AS (
                SELECT
                    DISTINCT event_history.product_idx AS idx
                FROM
                    event_history
                WHERE
                    event_history.event_idx = ANY($6)
                AND
                    event_history.start_date >= date_trunc('month', current_date)
                AND
                    event_history.start_date < date_trunc('month', current_date) + interval '1 month'
            ),
           product_info AS (
                SELECT
                    product.idx,
                    product.category_idx "categoryIdx",
                    product.name,
                    product.price,
                    product.image_url "productImg",
                    product.score,
                    product.created_at "createdAt",
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
                    TO_CHAR(current_date, 'YYYY-MM') AS "month",
                    ARRAY (
                        SELECT
                            json_build_object(
                                'companyIdx', event_history.company_idx,
                                'eventIdx', event_history.event_idx,
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
                    ) AS events
                    ${
                        selectProductsAllDao.companyIdx
                            ? `,
                     (
                        SELECT
                            SUM(
                                CASE
                                    WHEN
                                        event_history.company_idx = ${selectProductsAllDao.companyIdx}
                                    THEN
                                        event.priority * 2
                                    ELSE
                                         -event.priority
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
                    ) AS priority_score`
                            : ``
                    }
                FROM    
                    product
                WHERE
                    product.deleted_at IS NULL
                AND
                    product.name Like $4
                AND
                    product.category_idx = any($5)
            )
            SELECT
                *
            FROM
                product_info
            LEFT JOIN
                possible_product
            ON
                product_info.idx = possible_product.idx
            WHERE
                possible_product.idx IS NOT NULL
            ${selectProductsAllDao.companyIdx ? ` AND priority_score >= 0` : ``}
            ORDER BY
                ${selectProductsAllDao.companyIdx ? `priority_score DESC,` : ``}
                name
            LIMIT $2 OFFSET $3;
            `,
        [selectProductsAllDao.accountIdx, selectProductsAllDao.limit, selectProductsAllDao.offset, "%" + selectProductsAllDao.keyword + "%", selectProductsAllDao.categoryFilter, selectProductsAllDao.eventFilter],
        conn
    );
    console.log(selectProductsAllDao);
    console.log(queryResult.rows[0]);
    return queryResult.rows;
};

/**
 * score은 db에서 numeric으로 저장되지만 나올때는 string으로 출력
 * @param {GetProductByIdx} getProductByIdx
 * @param {pg.PoolClient} conn
 * @returns {Promise<Product | null>}
 * @throws {NotFoundException}
 *
 */
const selectProductByIdx = async (getProductByIdx, conn = pgPool) => {
    const { account, productIdx } = getProductByIdx;
    const selectResult = await query(
        `SELECT
            product.idx,
            product.category_idx "categoryIdx",
            product.name,
            product.price,
            product.image_url "productImg",
            product.score,
            product.created_at "createdAt",
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
            TO_CHAR(current_date, 'YYYY-MM') AS "month",
            ARRAY (
                SELECT
                    json_build_object(
                        'companyIdx', event_history.company_idx,
                        'eventIdx', event_history.event_idx,
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
            ) AS events
        FROM    
            product
        WHERE
            product.deleted_at IS NULL
        AND
            product.idx = $2`,
        [account.idx, productIdx],
        conn
    );

    return selectResult.rows[0];
};

module.exports = {
    selectProducts,
    selectProductByIdx,
};
