"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertaService = exports.AlertaService = void 0;
const logger_helper_1 = require("../helpers/logger.helper");
class AlertaService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async notificarAnomaliaCritica(anomalias) {
        const criticas = anomalias.filter((a) => a.esCritica);
        if (criticas.length === 0)
            return;
        logger_helper_1.Logger.warn(`🚨 [ALERTAS] Se han detectado ${criticas.length} anomalías críticas en el sistema.`, {
            detalles: criticas.map((a) => ({
                fecha: a.fecha,
                categoria: a.categoria,
            })),
        });
    }
}
exports.AlertaService = AlertaService;
exports.alertaService = new AlertaService();
//# sourceMappingURL=alerta.service.js.map