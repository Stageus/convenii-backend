const pg = require("pg");
const pgPool = require("../util/module/pgPool");
const query = require("../util/module/query");
const InsertBookmarkDao = require("./dao/insert-bookmark.dao");
const SelectBookmarkWithAccountDao = require("./dao/select-bookmarkWithAccount.dao");
const Bookmark = require("./model/bookmark.model");
const DeleteBookmarkDao = require("./dao/delete-bookmark.dao");
const SelectBookmarkedProductIdxDao = require("./dao/select-bookmarkedProductIdx.dao");

/**
 *
 * @param {InsertBookmarkDao} insertBookmarkDao
 * @param {pg.PoolClient} conn
 * @return {Promise<void>}
 */
const insertBookmark = async (insertBookmarkDao, conn = pgPool) => {
    await query(
        `
        INSERT INTO
            bookmark
            (account_idx, product_idx)
        VALUES
            ($1,$2)
        `,
        [insertBookmarkDao.account.idx, insertBookmarkDao.productIdx],
        conn
    );
};

/**
 *
 * @param {SelectBookmarkWithAccountDao} selectBookmarkWithAccountDao
 * @param {pg.PoolClient} conn
 * @return {Promise<Bookmark|null>}
 */
const selectBookmarkWithAccount = async (selectBookmarkWithAccountDao, conn = pgPool) => {
    const queryResult = await query(
        `
        SELECT
            idx,
            account_idx AS "accountIdx",
            product_idx AS "productIdx",
            created_at AS "createdAt"
        FROM
            bookmark
        WHERE
            account_idx=$1
        AND
            product_idx=$2
            `,
        [selectBookmarkWithAccountDao.account.idx, selectBookmarkWithAccountDao.productIdx],
        conn
    );

    return queryResult.rows[0] | null;
};

/**
 *
 * @param {DeleteBookmarkDao} deleteBookmarkDao
 * @param {pg.PoolClient} conn
 * @return {Promise<void>}
 */
const deleteBookmark = async (deleteBookmarkDao, conn = pgPool) => {
    await query(
        `
        DELETE
        FROM
            bookmark
        WHERE
            account_idx=$1
        AND
            product_idx=$2
        `,
        [deleteBookmarkDao.account.idx, deleteBookmarkDao.productIdx]
    );
};

/**
 *
 * @param {SelectBookmarkedProductIdxDao} selectBookmarkedProductIdxDao
 * @param {pg.PoolClient} conn
 * @return {Promise<Bookmark.productIdx[]>}
 */
const selectBookmarkedProductIdx = async (selectBookmarkedProductIdxDao, conn = pgPool) => {
    const queryResult = await query(
        `
        SELECT
            DISTINCT bookmark.product_idx AS "productIdx"
        FROM
            bookmark
        WHERE
            account_idx = $1    
        `,
        [selectBookmarkedProductIdxDao.account.idx],
        conn
    );

    return queryResult.rows;
};
module.exports = {
    insertBookmark,
    selectBookmarkWithAccount,
    deleteBookmark,
    selectBookmarkedProductIdx,
};
