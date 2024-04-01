const pgPool = require("./pgPool");

/**
 *
 * @param {string} sql
 * @param {any[]} values
 * @param {any} conn
 * @returns {Promise<any[]>}
 */
const query = async (sql, values, conn = pgPool) => {
    return await conn.query(sql, values);
};

module.exports = query;
