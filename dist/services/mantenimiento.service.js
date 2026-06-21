"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mantenimientoService = void 0;
const analitica_repository_1 = require("../repositories/analitica.repository");
const reportes_cache_1 = require("../cache/reportes.cache");
class MantenimientoService {
    async sincronizarDatosBase() {
        await analitica_repository_1.analiticaRepository.refrescarVistasMaterializadas();
        await reportes_cache_1.reportesCache.invalidarCachesGlobales();
    }
    async purgarCaches() {
        await reportes_cache_1.reportesCache.invalidarCachesGlobales();
    }
}
exports.mantenimientoService = new MantenimientoService();
//# sourceMappingURL=mantenimiento.service.js.map