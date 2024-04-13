const pgPool = require("../../src/util/module/pgPool");
const { NotFoundException } = require("../util/module/Exception");
const query = require("../util/module/query");
const Product = require("./dao/product.dao");
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
    const { page, userIdx } = getProductsDto;
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
        [userIdx, pageSizeOption, (parseInt(page) - 1) * pageSizeOption],
        conn
    );
    if (!selectResult.rows.length) {
        throw new NotFoundException("cannot find products");
    }
    return selectResult.rows;
};

module.exports = {
    selectProducts,
};
