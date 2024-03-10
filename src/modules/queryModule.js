const connectPostgresql = require("../config/postgresqlConfig");

const queryModule = async (sql, params) => {
    let client;
    try {
        const pool = await connectPostgresql();
        client = await pool.connect();
        const result = await client.query(sql, params);
        return result.rows;
    } catch (error) {
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

module.exports = queryModule;