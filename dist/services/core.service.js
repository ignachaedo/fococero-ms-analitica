"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreService = void 0;
const crypto_1 = require("crypto");
const analitica_repository_1 = require("../repositories/analitica.repository");
const reportes_cache_1 = require("../cache/reportes.cache");
const redis_mutex_1 = require("../cache/redis.mutex");
const riesgo_calculator_1 = require("../ml/riesgo.calculator");
const anomalias_detector_1 = require("../ml/anomalias.detector");
const estadisticas_transformer_1 = require("../transformers/estadisticas.transformer");
class CoreService {
    /**
     * Genera el ID del bloqueo de Redis usando la misma lógica de normalización que el caché.
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
    async obtenerDatosBaseSeguros(params, cacheKey) {
        const cached = await reportes_cache_1.reportesCache.getEstadisticas(params);
        if (cached && Array.isArray(cached))
            return cached;
        const acquired = await redis_mutex_1.RedisMutex.adquirirBloqueo(cacheKey, 15);
        if (!acquired) {
            await redis_mutex_1.RedisMutex.esperarBloqueo(cacheKey);
            const retry = await reportes_cache_1.reportesCache.getEstadisticas(params);
            if (retry && Array.isArray(retry))
                return retry;
            throw new Error("Fallo de sincronización en caché");
        }
        try {
            const datosDb = await analitica_repository_1.analiticaRepository.obtenerEstadisticasBase(params);
            // Transformamos a formato estadístico
            const procesadosRaw = riesgo_calculator_1.RiesgoCalculator.procesarEstadisticas(datosDb);
            const datosProcesados = (Array.isArray(procesadosRaw)
                ? procesadosRaw
                : [procesadosRaw]);
            // Guardamos en caché pasando 'params' directamente
            await reportes_cache_1.reportesCache.setEstadisticas(params, datosProcesados);
            return datosProcesados;
        }
        finally {
            await redis_mutex_1.RedisMutex.liberarBloqueo(cacheKey);
        }
    }
    async calcularKpis(params) {
        const key = this.generarLockId("lock:core:kpi", params);
        const datos = await this.obtenerDatosBaseSeguros(params, key);
        return estadisticas_transformer_1.EstadisticasTransformer.extraerKpis(datos);
    }
    async calcularTendencias(params) {
        const key = this.generarLockId("lock:core:tendencia", params);
        const datos = await this.obtenerDatosBaseSeguros(params, key);
        return estadisticas_transformer_1.EstadisticasTransformer.extraerTendencias(datos);
    }
    async calcularDistribucion(params) {
        const key = this.generarLockId("lock:core:dist", params);
        const datos = await this.obtenerDatosBaseSeguros(params, key);
        return estadisticas_transformer_1.EstadisticasTransformer.extraerDistribucion(datos);
    }
    async detectarAnomalias(params) {
        const key = this.generarLockId("lock:core:anomalia", params);
        const datos = await this.obtenerDatosBaseSeguros(params, key);
        return anomalias_detector_1.AnomaliasDetector.analizarTendencias(datos);
    }
    async calcularKpisCiudadano(params, _userId) {
        const key = this.generarLockId("lock:core:kpi-ciudadano", params);
        const datos = await this.obtenerDatosBaseSeguros(params, key);
        return estadisticas_transformer_1.EstadisticasTransformer.extraerKpis(datos);
    }
    async calcularKpisBrigadista(params) {
        const key = this.generarLockId("lock:core:kpi-brigadista", params);
        const datos = await this.obtenerDatosBaseSeguros(params, key);
        return estadisticas_transformer_1.EstadisticasTransformer.extraerKpis(datos);
    }
    async calcularKpisAdmin(params) {
        const key = this.generarLockId("lock:core:kpi-admin", params);
        const datos = await this.obtenerDatosBaseSeguros(params, key);
        return estadisticas_transformer_1.EstadisticasTransformer.extraerKpis(datos);
    }
}
exports.coreService = new CoreService();
//# sourceMappingURL=core.service.js.map