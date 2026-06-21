"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomaliasJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const core_service_1 = require("../services/core.service");
const alerta_service_1 = require("../services/alerta.service");
const logger_helper_1 = require("../helpers/logger.helper");
class AnomaliasJob {
    static iniciar() {
        node_cron_1.default.schedule("0 * * * *", async () => {
            try {
                const hoy = new Date();
                const hace30Dias = new Date();
                hace30Dias.setDate(hoy.getDate() - 30);
                const anomalias = await core_service_1.coreService.detectarAnomalias({
                    startDate: hace30Dias,
                    endDate: hoy,
                });
                await alerta_service_1.alertaService.notificarAnomaliaCritica(anomalias);
            }
            catch (error) {
                logger_helper_1.Logger.error("[CRON ERROR] Fallo en motor de anomalías", { error });
            }
        });
    }
}
exports.AnomaliasJob = AnomaliasJob;
//# sourceMappingURL=anomalias.job.js.map