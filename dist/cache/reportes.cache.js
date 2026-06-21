"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportesCache = void 0;
const crypto_1 = require("crypto");
const redis_1 = require("../config/redis");
class ReportesCache {
    TTL_SECONDS = 3600;
    generarClaveHash(prefix, params) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((acc, key) => {
            const value = params[key];
            // Normalizamos fechas para que el hash sea consistente
            acc[key] = value instanceof Date ? value.toISOString() : value;
            return acc;
        }, {});
        const hash = (0, crypto_1.createHash)("sha256")
            .update(JSON.stringify(sortedParams))
            .digest("hex");
        return `${prefix}:${hash}`;
    }
    async getEstadisticas(params) {
        const key = this.generarClaveHash("stats", params);
        return redis_1.redisCache.get(key);
    }
    async setEstadisticas(params, data) {
        const key = this.generarClaveHash("stats", params);
        await redis_1.redisCache.set(key, data, this.TTL_SECONDS);
    }
    async getMapaCalor(params) {
        const key = this.generarClaveHash("heatmap", params);
        return redis_1.redisCache.get(key);
    }
    async setMapaCalor(params, data) {
        const key = this.generarClaveHash("heatmap", params);
        await redis_1.redisCache.set(key, data, this.TTL_SECONDS);
    }
    async invalidarCachesGlobales() {
        // Accedemos al cliente interno mediante un casteo seguro a unknown
        const wrapper = redis_1.redisCache;
        const client = wrapper.client;
        if (!client)
            return;
        const heatmapKeys = await client.keys("heatmap:*");
        const statsKeys = await client.keys("stats:*");
        const allKeys = [...heatmapKeys, ...statsKeys];
        if (allKeys.length > 0) {
            await client.del(...allKeys);
        }
    }
}
exports.reportesCache = new ReportesCache();
//# sourceMappingURL=reportes.cache.js.map