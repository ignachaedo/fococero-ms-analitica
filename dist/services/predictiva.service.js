"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictivaService = void 0;
const analitica_repository_1 = require("../repositories/analitica.repository");
class PredictivaService {
    DIAS_PROYECCION = 7;
    PERIODO_VENTANA_MMS = 14;
    async generarPronostico(params) {
        const datosHistoricos = await analitica_repository_1.analiticaRepository.obtenerSerieTiempoDiaria(params.startDate, params.endDate);
        if (datosHistoricos.length < this.PERIODO_VENTANA_MMS) {
            throw new Error("Datos históricos insuficientes para calcular un pronóstico estadísticamente válido.");
        }
        const pronostico = [];
        const valores = datosHistoricos.map((d) => Number(d.total_incidentes) || 0);
        const ultimaFecha = new Date(datosHistoricos[datosHistoricos.length - 1].fecha_sk);
        for (let i = 0; i < this.DIAS_PROYECCION; i++) {
            const ventana = valores.slice(-this.PERIODO_VENTANA_MMS);
            const promedio = ventana.reduce((a, b) => a + b, 0) / this.PERIODO_VENTANA_MMS;
            const varianza = ventana.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) /
                this.PERIODO_VENTANA_MMS;
            const desviacionEstandar = Math.sqrt(varianza);
            valores.push(promedio);
            ultimaFecha.setDate(ultimaFecha.getDate() + 1);
            pronostico.push({
                fecha: ultimaFecha.toISOString().split("T")[0],
                incidentes_estimados: Math.round(promedio),
                margen_error_positivo: Math.round(promedio + desviacionEstandar),
                margen_error_negativo: Math.max(0, Math.round(promedio - desviacionEstandar)),
            });
        }
        return pronostico;
    }
}
exports.predictivaService = new PredictivaService();
//# sourceMappingURL=predictiva.service.js.map