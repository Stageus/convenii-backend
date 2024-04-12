const query = require("../modules/query");
const pgPool = require("../modules/pgPool");
const { BadRequestException, NotFoundException } = require("../modules/Exception");
const ProductDataDto = require("../dto/productDto/ProductDataDto");
const ProductsWithEventsDataDto = require("../dto/productDto/ProductsWithEventsDataDto");
/**
 * score은 db에서 numeric으로 저장되지만 나올때는 string으로 출력
 * @param {number} userIdx
 * @param {number} productIdx
 * @param {pg.PoolClient} conn
 * @returns {Promise<ProductDataDto>}
 * @throws {NotFoundException}
 *
 */
const getProductDataByIdx = async (userIdx, productIdx, conn = pgPool) => {
    const productSelectResult = await query(
        `SELECT
            product.idx,
            product.category_idx,
            product.name,
            product.price,
            product.image_url,
            product.score,
            product.created_at,
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
            product.idx = $2`,
        [userIdx, productIdx],
        conn
    );
    if (!productSelectResult.rows.length) {
        throw new NotFoundException("Cannot find product");
    }

    return new ProductDataDto(productSelectResult.rows[0]);
};

/**
 *
 * @param {number} userIdx
 * @param {number} page
 * @param {number} pageSizeOption
 * @param {pg.PoolClient} conn
 *
 * @returns {Promise<ProductsWithEventsDataDto>}
 * @throws {NotFoundException}
 */
const getProductsWithEventsData = async (userIdx, page, pageSizeOption, conn = pgPool) => {
    const productsSelectResult = await query(
        `
            SELECT
                product.idx,
                product.category_idx,
                product.name,
                product.price,
                product.image_url,
                product.score,
                product.created_at,
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
    if (!productsSelectResult.rows.length) {
        throw new NotFoundException("cannot find products");
    }
    return new ProductsWithEventsDataDto(productsSelectResult.rows);
};

/**
 *
 * @param { {
 *  userIdx: number,
 *  companyIdx: number,
 *  pageSizeOption: number,
 *  companySize: number.Array
 * }}
 * @param {pg.PoolClient} conn
 * @returns {Promise<ProductsWithEventsDataDto>}
 * @throws {NotFoundException}
 */
const getProductsWithEventsDataByCompanyIdx = async ({ userIdx, companyIdx, pageSizeOption, offset, companySize, conn = pgPool }) => {
    const productsSelectResult = await query(
        `
            WITH productInfo AS (
                SELECT
                    product.idx,
                    product.category_idx,
                    product.name,
                    product.price,
                    product.image_url,
                    product.score,
                    product.created_at,
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
                                    WHEN event_history.company_idx = $2 THEN event.priority * $5
                                    ELSE -event.priority
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
                    ) AS priorityScore
                FROM    
                    product
                WHERE
                    product.deleted_at IS NULL
            )
            SELECT * FROM productInfo
            WHERE priorityScore >= 0
            ORDER BY priorityScore DESC, name
            LIMIT $3 OFFSET $4;
            `,
        [userIdx, companyIdx, pageSizeOption, offset, companySize - 1],
        conn
    );
    if (!productsSelectResult.rows.length) {
        throw new NotFoundException("cannot find products");
    }
    return new ProductsWithEventsDataDto(productsSelectResult.rows);
};

/**
 *
 * @param {number} userIdx
 * @param {string} keyword
 * @param {Array<number>} categoryFilter
 * @param {Array<number>} eventFilter
 * @param {number} pageSizeOption
 * @param {number} page
 * @param {pg.PoolClient} conn
 * @param {
 *  userIdx: number,
 *  keyword: string,
 *  categoryFilter: Array<number>,
 *  eventFilter: Array<number>,
 *  pageSizeOption: number,
 *  page: number,
 *  conn: pg.PoolClient
 * }
 * @returns {Promise<ProductsWithEventsDataDto>}
 * @throws {NotFoundException}
 */
const getProductsWithEventsDataBySearch = async ({ userIdx, keyword, categoryFilter, eventFilter, page, pageSizeOption, conn = pgPool }) => {
    const productsSelectResult = await query(
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
        [userIdx, "%" + keyword + "%", categoryFilter, eventFilter, pageSizeOption, (parseInt(page) - 1) * pageSizeOption],
        conn
    );

    if (!productsSelectResult.rows.length) {
        throw new NotFoundException("cannot find products");
    }
    return new ProductsWithEventsDataDto(productsSelectResult.rows);
};

/**
 *
 * @param {number} categoryIdx
 * @param {string} name
 * @param {string} price
 * @param {req.file} file
 * @param {PoolClient} conn
 * @returns {Promise<number>}
 */
const postProductData = async (categoryIdx, name, price, file, conn) => {
    const product = await query(
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
        [categoryIdx, name, price, file.location],
        conn
    );

    return product.rows[0].idx;
};

/**
 *
 * @param {number} productIdx
 * @returns {Promise<boolean>}
 */
const checkProductExistByIdx = async (productIdx) => {
    const productExistenceCheck = await query(
        `
            SELECT idx
            FROM product
            WHERE idx = $1
        `,
        [productIdx]
    );

    // 존재하지 않는 productIdx인 경우
    if (productExistenceCheck.rows.length === 0) {
        return false;
    }
    return true;
};

/**
 *
 * @param {number} productIdx
 * @param {number} categoryIdx
 * @param {string} name
 * @param {string} price
 * @param {req.file} file
 * @param {PoolClient} conn
 * @returns
 */
const putProductData = async (productIdx, categoryIdx, name, price, file, conn) => {
    const imageUrl = file ? file.location : null;
    const updateParams = [categoryIdx, name, price, productIdx];
    if (file) {
        updateParams.push(imageUrl);
    }

    return await query(
        `
            UPDATE
                product
            SET
                category_idx = $1,
                name = $2,
                price = $3
                ${imageUrl ? ", image_url = $5" : ""}
            WHERE
                idx = $4            
        `,
        updateParams,
        conn
    );
};

const deleteProductData = async (productIdx) => {
    await query(
        `
            UPDATE
                product
            SET
                deleted_at = current_date
            WHERE
                idx = $1
            `,
        [productIdx]
    );
    return;
};
module.exports = {
    getProductDataByIdx,
    getProductsWithEventsData,
    getProductsWithEventsDataByCompanyIdx,
    getProductsWithEventsDataBySearch,
    postProductData,
    checkProductExistByIdx,
    putProductData,
    deleteProductData,
};
