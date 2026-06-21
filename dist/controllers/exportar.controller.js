"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportarController = exports.ExportarController = void 0;
const exportar_service_1 = require("../services/exportar.service");
const analitica_validator_1 = require("../validators/analitica.validator");
const catch_async_helper_1 = require("../helpers/catch-async.helper");
class ExportarController {
    descargarCsv = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        const { buffer, filename } = await exportar_service_1.exportarService.generarReporteCsv(params);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.status(200).send(buffer);
    });
    descargarPdf = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        const { buffer, filename } = await exportar_service_1.exportarService.generarReportePdf(params);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.status(200).send(buffer);
    });
}
exports.ExportarController = ExportarController;
exports.exportarController = new ExportarController();
//# sourceMappingURL=exportar.controller.js.map