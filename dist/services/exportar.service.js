"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportarService = exports.ExportarService = void 0;
const analitica_repository_1 = require("../repositories/analitica.repository");
class ExportarService {
    async generarReporteCsv(params) {
        const datosDb = await analitica_repository_1.analiticaRepository.obtenerEstadisticasBase(params);
        if (datosDb.length === 0) {
            throw new Error("No hay datos disponibles para el rango seleccionado");
        }
        const cabeceras = Object.keys(datosDb[0]).join(",");
        const filas = datosDb.map((row) => Object.values(row)
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(","));
        const csvString = [cabeceras, ...filas].join("\n");
        const buffer = Buffer.from("\uFEFF" + csvString, "utf8");
        const timestamp = new Date().toISOString().split("T")[0];
        return {
            buffer,
            filename: `fococero_export_${timestamp}.csv`,
        };
    }
    async generarReportePdf(_params) {
        const timestamp = new Date().toISOString().split("T")[0];
        const pdfSimulado = Buffer.from("%PDF-1.4\n%Reporte Gerencial FocoCero\n", "utf8");
        return {
            buffer: pdfSimulado,
            filename: `fococero_reporte_${timestamp}.pdf`,
        };
    }
}
exports.ExportarService = ExportarService;
exports.exportarService = new ExportarService();
//# sourceMappingURL=exportar.service.js.map