"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadisticasTransformer = void 0;
class EstadisticasTransformer {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static extraerKpis(datos) {
        return {
            total: datos.reduce((acc, curr) => acc + curr.total_incidentes, 0),
            promedioRespuesta: datos.reduce((acc, curr) => acc + curr.prom_respuesta_seg, 0) /
                (datos.length || 1),
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static extraerTendencias(datos) {
        return datos.map((d) => ({ x: d.fecha, y: d.total_incidentes }));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static extraerDistribucion(datos) {
        const map = {};
        datos.forEach((d) => {
            map[d.categoria] = (map[d.categoria] || 0) + d.total_incidentes;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }
}
exports.EstadisticasTransformer = EstadisticasTransformer;
//# sourceMappingURL=estadisticas.transformer.js.map