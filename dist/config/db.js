"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDbConnection = exports.dbPool = void 0;
const pg_1 = require("pg");
const envs_1 = require("./envs");
const logger_helper_1 = require("../helpers/logger.helper");
exports.dbPool = new pg_1.Pool({
    host: envs_1.envs.DB_HOST,
    port: envs_1.envs.DB_PORT,
    user: envs_1.envs.DB_USER,
    password: envs_1.envs.DB_PASSWORD,
    database: envs_1.envs.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    application_name: "ms-analitica-worker",
});
exports.dbPool.on("error", (err) => {
    logger_helper_1.Logger.error("🔥 [DB] Fatal error en el Pool de Conexiones:", err);
    process.exit(-1);
});
const checkDbConnection = async () => {
    const client = await exports.dbPool.connect();
    try {
        await client.query("SELECT 1");
        logger_helper_1.Logger.info("📦 PostgreSQL [Analítica] Conectado Exitosamente");
    }
    finally {
        client.release();
    }
};
exports.checkDbConnection = checkDbConnection;
//# sourceMappingURL=db.js.map