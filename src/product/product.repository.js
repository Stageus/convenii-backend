const pgPool = require("../../src/util/module/pgPool");
const { NotFoundException } = require("../util/module/Exception");
const query = require("../util/module/query");
const Product = require("./dao/product.dao");
const GetProductsByCompanyDto = require("./dto/GetProductsByCompanyDto");
const GetProductsBySearchDto = require("./dto/GetProductsBySearchDto");
const GetProductsDto = require("./dto/GetProductsDto");
const pageSizeOption = process.env.PAGE_SIZE_OPTION;

/**
 *
 * @param {GetProductsDto} getProductsDto
 * @param {pg.PoolClient} conn
 *
 * @returns {Promise<Product[]>}
 * @throws {NotFoundException}
 */
const selectProducts = async (getProductsDto, conn = pgPool) => {
    const { page, account } = getProductsDto;

    const selectResult = await query(
        `
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
            FROM    
                product
            WHERE
                product.deleted_at IS NULL
            ORDER BY
                product.name
            LIMIT $2 OFFSET $3
            `,
        [account.idx, pageSizeOption, (parseInt(page) - 1) * pageSizeOption],
        conn
    );
    if (!selectResult.rows.length) {
        throw new NotFoundException("cannot find products");
    }
    return selectResult.rows;
};
/**
 *
 * @param {GetProductsByCompanyDto} GetProductsByCompanyDto
 * @param {pg.PoolClient} conn
 *
 * @returns {Promise<Product[]>}
 * @throws {NotFoundException}
 */
const selectProductsByCompany = async (getProductsByCompanyDto, conn = pgPool) => {
    const { account, companyIdx, pageLimit, pageOffset } = getProductsByCompanyDto;
    const selectResult = await query(
        `
            WITH product_info AS (
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
                    ) AS events,
                    (
                        SELECT
                            SUM(
                                CASE
                                    WHEN
                                        event_history.company_idx = $2
                                    THEN
                                        event.priority * $5
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
                    ) AS priority_score
                FROM    
                    product
                WHERE
                    product.deleted_at IS NULL
            )
            SELECT
                *
            FROM
                product_info
            WHERE
                priority_score >= 0
            ORDER BY
                priority_score DESC, name
            LIMIT $3 OFFSET $4;
            `,
        [account.idx, companyIdx, pageLimit, pageOffset, process.env.COMPANY_SIZE - 1],
        conn
    );
    if (!selectResult.rows.length) {
        throw new NotFoundException("cannot find products");
    }
    return selectResult.rows;
};
/**
 *
 * @param {GetProductsBySearchDto} getProductsBySearchDto
 * @param {pg.PoolClient} conn
 * @returns {Promise<Product[]>}
 * @throws {NotFoundException}
 */
const selectProductsBySearch = async (getProductsBySearchDto, conn = pgPool) => {
    const { account, keyword, categoryFilter, eventFilter, pageOffset } = getProductsBySearchDto;

    const selectResult = await query(
        `
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
                product.category_idx "categoryIdx",
                product.name,
                product.price,
                product.image_url "productImg",
                product.score,
                product.created_at "createdAt",
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
            `,
        [account.idx, "%" + keyword + "%", categoryFilter, eventFilter, pageSizeOption, pageOffset],
        conn
    );

    if (!selectResult.rows.length) {
        throw new NotFoundException("cannot find products");
    }
    return selectResult.rows;
};

module.exports = {
    selectProducts,
    selectProductsByCompany,
    selectProductsBySearch,
};
