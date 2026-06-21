"use strict";
// src/services/ingesta.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestaService = void 0;
const analitica_repository_1 = require("../repositories/analitica.repository");
const incidente_transformer_1 = require("../transformers/incidente.transformer");
class IngestaService {
    async procesarEventoIncidente(rawPayload) {
        const incidente = incidente_transformer_1.IncidenteTransformer.aFactIncidente(rawPayload);
        await analitica_repository_1.analiticaRepository.asegurarDimensionTiempo(incidente.fecha_ocurrencia);
        await analitica_repository_1.analiticaRepository.ingestarIncidente(incidente);
    }
    async procesarLoteIncidentes(rawPayloads) {
        const incidentes = incidente_transformer_1.IncidenteTransformer.aFactIncidenteBatch(rawPayloads);
        const fechasUnicas = new Map();
        for (const inc of incidentes) {
            if (!fechasUnicas.has(inc.fecha_sk)) {
                fechasUnicas.set(inc.fecha_sk, inc.fecha_ocurrencia);
            }
        }
        const promesasDimensiones = Array.from(fechasUnicas.values()).map((fecha) => analitica_repository_1.analiticaRepository.asegurarDimensionTiempo(fecha));
        await Promise.all(promesasDimensiones);
        const promesasIngesta = incidentes.map((inc) => analitica_repository_1.analiticaRepository.ingestarIncidente(inc));
        await Promise.all(promesasIngesta);
    }
}
exports.ingestaService = new IngestaService();
//# sourceMappingURL=ingesta.service.js.map