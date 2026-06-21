"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MantenimientoJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const mantenimiento_service_1 = require("../services/mantenimiento.service");
const logger_1 = require("../config/logger");
class MantenimientoJob {
    static iniciar() {
        node_cron_1.default.schedule("0 3 * * *", async () => {
            try {
                await mantenimiento_service_1.mantenimientoService.sincronizarDatosBase();
            }
            catch (error) {
                logger_1.logger.error(`[CRON ERROR] ${new Date().toISOString()} - ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
}
exports.MantenimientoJob = MantenimientoJob;
//# sourceMappingURL=mantenimiento.job.js.map