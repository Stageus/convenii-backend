const pg = require("pg");
const pgPool = require("../util/module/pgPool");
const query = require("../util/module/query");
const SelectAccountByEmailDao = require("./dao/select-accountByEmail.dao");
const SelectAccountByNicknameDao = require("./dao/select-accountByNickname.dao");
const AcountWithoutAuth = require("./model/accountWithOutAuth.model");
const InsertAccountDao = require("./dao/insert-account.dao");
const DeleteAccountDao = require("./dao/delete-account.dao");
const UpdateAccountDao = require("./dao/update-account.dao");

/**
 *
 * @param {SelectAccountByEmailDao} selectAccountByEmailDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<AcountWithoutAuth>}
 */
const selectAccountByEmail = async (selectAccountByEmailDao, conn = pgPool) => {
    const queryResult = await query(
        `
            SELECT
                idx,
                password,
                email,
                rank_idx AS "rankIdx",
                created_at AS "createdAt",
                nickname
            FROM 
                account
            WHERE 
                email =$1 
            AND 
                deleted_at IS NULL
        `,
        [selectAccountByEmailDao.email],
        conn
    );

    return queryResult.rows[0];
};

/**
 *
 * @param {SelectAccountByNicknameDao} selectAccountByNicknameDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<AcountWithoutAuth>}
 */
const selectAccountByNickname = async (selectAccountByNicknameDao, conn = pgPool) => {
    const queryResult = await query(
        `
            SELECT
                idx,
                password,
                email,
                rank_idx AS "rankIdx",
                created_at AS "createdAt",
                nickname
            FROM
                account
            WHERE
                nickname = $1
            AND
                deleted_at IS NULL
        `,
        [selectAccountByNicknameDao.email],
        conn
    );

    return queryResult.rows[0];
};

/**
 *
 * @param {InsertAccountDao} insertAccountDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<void>}
 */
const insertAccount = async (insertAccountDao, conn = pgPool) => {
    await query(
        `
            INSERT INTO account
                (email,password,nickname)
            VALUES
                ($1,$2,$3)
        `,
        [insertAccountDao.email, insertAccountDao.hashedPw, insertAccountDao.nickname],
        conn
    );
};

/**
 *
 * @param {DeleteAccountDao} deleteAccountDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<void>}
 */
const deleteAccount = async (deleteAccountDao, conn = pgPool) => {
    await query(
        `
            UPDATE
                account
            SET
                deleted_at = NOW()
            WHERE
                idx = $1
        `,
        [deleteAccountDao.idx],
        conn
    );
};

/**
 *
 * @param {UpdateAccountDao} updateAccountDao
 * @param {pg.PoolClient} conn
 * @returns {Promise<void>}
 */
const updateAccount = async (updateAccountDao, conn = pgPool) => {
    await query(
        `
            UPDATE
                account
            SET
                password =$1
            WHERE
                idx = $2
        `,
        [updateAccountDao.hashedPw, updateAccountDao.idx],
        conn
    );
};

module.exports = {
    selectAccountByEmail,
    selectAccountByNickname,
    insertAccount,
    deleteAccount,
    updateAccount,
};
