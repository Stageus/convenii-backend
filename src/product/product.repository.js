const pgPool = require("../../src/util/module/pgPool");
const query = require("../util/module/query");
const Product = require("./model/product.model");
const SelectProductDao = require("./dao/select-product.dao");
const SelectProductsAllDao = require("./dao/select-productsAll.dao");
const UpdateProductDao = require("./dao/update-product.dao");
const DeleteProductDao = require("./dao/delete-product.dao");
const CreateProductDao = require("./dao/create-product.dao");

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
                    ) IS NOT NULL AS "bookmarked"
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
            ORDER BY
                name
            LIMIT $2 OFFSET $3;
            `,
        [selectProductsAllDao.account.idx, selectProductsAllDao.limit, selectProductsAllDao.offset, "%" + selectProductsAllDao.keyword + "%", selectProductsAllDao.categoryFilter, selectProductsAllDao.eventFilter],
        conn
    );
    return queryResult.rows;
};

/**
 * score은 db에서 numeric으로 저장되지만 나올때는 string으로 출력
 * @param {SelectProductDao} selectProductDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<Product | null>}
 * @throws {NotFoundException}
 *
 */
const selectProductByIdx = async (selectProductDao, conn = pgPool) => {
    const queryResult = await query(
        `
            SELECT
                idx,
                category_idx "categoryIdx",
                name,
                price,
                image_url "productImg",
                score,
                created_at "createdAt",
                (
                    SELECT
                        bookmark.idx
                    FROM
                        bookmark
                    WHERE
                        account_idx = $1
                    AND
                        product_idx = product.idx
                ) IS NOT NULL AS "bookmarked"
            FROM    
                product
            WHERE
                idx = $2
            AND
                deleted_at IS NULL
        `,
        [selectProductDao.account.idx, selectProductDao.productIdx],
        conn
    );

    return queryResult.rows[0];
};

/**
 *
 * @param {CreateProductDao} createProductDao
 * @param {pgPool.PoolClient} conn
 * @returns {Promise<number>}
 */
const insertProduct = async (createProductDao, conn = pgPool) => {
    const queryResult = await query(
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
        [createProductDao.categoryIdx, createProductDao.name, createProductDao.price, createProductDao.productImg],
        conn
    );

    return queryResult.rows[0];
};

/**
 *
 * @param {UpdateProductDao} updateProductDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<pg.QueryResult>}
 */
const updateProduct = async (updateProductDao, conn = pgPool) => {
    const params = [updateProductDao.productIdx, updateProductDao.categoryIdx, updateProductDao.name, updateProductDao.price];
    if (updateProductDao.productImg) {
        params.push(updateProductDao.productImg);
    }
    return await query(
        `
            UPDATE
                product
            SET
                category_idx = $2,
                name = $3,
                price = $4
                ${updateProductDao.productImg ? ", image_url = $5" : ""}
            WHERE
                idx = $1       
        `,
        params,
        conn
    );
};
/**
 *
 * @param {DeleteProductDao} deleteProductDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<pg.QueryResult>}
 */
const deleteProduct = async (deleteProductDao, conn = pgPool) => {
    return await query(
        `
            UPDATE
                product
            SET
                deleted_at = current_date
            WHERE
                idx = $1
        `,
        [deleteProductDao.productIdx],
        conn
    );
};
module.exports = {
    selectProducts,
    selectProductByIdx,
    insertProduct,
    updateProduct,
    deleteProduct,
};
