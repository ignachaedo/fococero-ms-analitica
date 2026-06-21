"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisCache = void 0;
const redis_1 = require("redis");
const envs_1 = require("./envs");
const logger_helper_1 = require("../helpers/logger.helper");
class RedisCache {
    static instance;
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({
            socket: {
                host: envs_1.envs.REDIS_HOST,
                port: envs_1.envs.REDIS_PORT,
                reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
            },
        });
        this.client.on("error", (err) => logger_helper_1.Logger.error("🔴 [Redis] Error:", err));
        this.client.on("ready", () => logger_helper_1.Logger.info("🟢 Redis [Caché] Conectado Exitosamente"));
    }
    static getInstance() {
        if (!RedisCache.instance)
            RedisCache.instance = new RedisCache();
        return RedisCache.instance;
    }
    async connect() {
        if (!this.client.isOpen)
            await this.client.connect();
    }
    async get(key) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }
    async set(key, value, ttlSeconds = 3600) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
    }
    async del(key) {
        await this.client.del(key);
    }
}
exports.redisCache = RedisCache.getInstance();
//# sourceMappingURL=redis.js.map