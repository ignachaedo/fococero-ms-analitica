"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtrosService = void 0;
const analitica_repository_1 = require("../repositories/analitica.repository");
const redis_1 = require("../config/redis");
const redis_mutex_1 = require("../cache/redis.mutex");
class FiltrosService {
    async obtenerFiltroGenerico(clave, fetchFn) {
        const cacheKey = `analitica:filtros:${clave}`;
        const lockKey = `lock:filtros:${clave}`;
        const client = redis_1.redisCache["client"];
        const cached = await client.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const acquired = await redis_mutex_1.RedisMutex.adquirirBloqueo(lockKey, 10);
        if (!acquired) {
            await redis_mutex_1.RedisMutex.esperarBloqueo(lockKey);
            const retryCached = await client.get(cacheKey);
            if (retryCached)
                return JSON.parse(retryCached);
            throw new Error("Timeout al sincronizar filtros desde caché");
        }
        try {
            const data = await fetchFn();
            await client.setEx(cacheKey, 3600, JSON.stringify(data));
            return data;
        }
        finally {
            await redis_mutex_1.RedisMutex.liberarBloqueo(lockKey);
        }
    }
    async listarCategorias() {
        return this.obtenerFiltroGenerico("categorias", () => analitica_repository_1.analiticaRepository.obtenerCategoriasUnicas());
    }
    async listarOrigenes() {
        return this.obtenerFiltroGenerico("origenes", () => analitica_repository_1.analiticaRepository.obtenerOrigenesUnicos());
    }
    async listarSeveridades() {
        return this.obtenerFiltroGenerico("severidades", () => analitica_repository_1.analiticaRepository.obtenerSeveridadesUnicas());
    }
}
exports.filtrosService = new FiltrosService();
//# sourceMappingURL=filtros.service.js.map