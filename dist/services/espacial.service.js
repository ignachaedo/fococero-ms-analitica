"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.espacialService = void 0;
const crypto_1 = require("crypto");
const analitica_repository_1 = require("../repositories/analitica.repository");
const reportes_cache_1 = require("../cache/reportes.cache");
const redis_mutex_1 = require("../cache/redis.mutex");
const geojson_transformer_1 = require("../ml/geojson.transformer");
class EspacialService {
    /**
     * Genera un ID de bloqueo único.
     * Normaliza las fechas a ISO string para que el hash sea determinista.
     */
    generarLockId(prefijo, params) {
        const paramsRecord = params;
        const sortedParams = Object.keys(paramsRecord)
            .sort()
            .reduce((acc, key) => {
            const value = paramsRecord[key];
            acc[key] = value instanceof Date ? value.toISOString() : value;
            return acc;
        }, {});
        const hash = (0, crypto_1.createHash)("sha256")
            .update(JSON.stringify(sortedParams))
            .digest("hex");
        return `${prefijo}:${hash}`;
    }
    async generarMapaCalor(params) {
        const cacheKey = this.generarLockId("lock:espacial:heatmap", params);
        // 1. Intentar obtener del caché (ahora acepta THeatmapQuery directamente)
        let cachedMap = await reportes_cache_1.reportesCache.getMapaCalor(params);
        if (cachedMap)
            return cachedMap;
        const acquired = await redis_mutex_1.RedisMutex.adquirirBloqueo(cacheKey, 15);
        if (!acquired) {
            await redis_mutex_1.RedisMutex.esperarBloqueo(cacheKey);
            cachedMap = await reportes_cache_1.reportesCache.getMapaCalor(params);
            if (!cachedMap)
                throw new Error("Consistencia de caché geoespacial fallida");
            return cachedMap;
        }
        try {
            // 2. Obtener datos crudos de la DB (IFactIncidente[])
            const datosDb = await analitica_repository_1.analiticaRepository.obtenerDatosMapaCalor(params);
            /**
             * SOLUCIÓN AL ERROR:
             * Mapeamos los datos de la DB al contrato IMVMapaCalorGeohash.
             * Incluimos el 'geohash' que es obligatorio y calculamos la 'intensidad'.
             */
            const datosParaMapa = datosDb.map((inc) => ({
                geohash: inc.geohash,
                categoria: inc.categoria,
                intensidad: inc.severidad === "ALTA"
                    ? 1.0
                    : inc.severidad === "MEDIA"
                        ? 0.7
                        : 0.4,
            }));
            // 3. Transformación a GeoJSON (Sin usar 'any', usando el contrato estricto)
            const geoJson = geojson_transformer_1.GeoJsonTransformer.aMapaCalor(datosParaMapa);
            // 4. Guardar en caché
            await reportes_cache_1.reportesCache.setMapaCalor(params, geoJson);
            return geoJson;
        }
        finally {
            await redis_mutex_1.RedisMutex.liberarBloqueo(cacheKey);
        }
    }
    async obtenerDetallePorGeohash(params) {
        return analitica_repository_1.analiticaRepository.obtenerIncidentesPorGeohash(params.geohash, params.limite);
    }
    async obtenerIncidentesPorRadio(params) {
        const cacheKey = this.generarLockId("lock:espacial:radio", params);
        const acquired = await redis_mutex_1.RedisMutex.adquirirBloqueo(cacheKey, 10);
        if (!acquired)
            throw new Error("Área en procesamiento. Reintente en breve.");
        try {
            return await analitica_repository_1.analiticaRepository.obtenerIncidentesPorRadio(params.lat, params.lng, params.radioMetros, params.startDate, params.endDate);
        }
        finally {
            await redis_mutex_1.RedisMutex.liberarBloqueo(cacheKey);
        }
    }
}
exports.espacialService = new EspacialService();
//# sourceMappingURL=espacial.service.js.map