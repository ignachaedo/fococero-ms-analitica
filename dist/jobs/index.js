"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRegistry = void 0;
const mantenimiento_job_1 = require("./mantenimiento.job");
const anomalias_job_1 = require("./anomalias.job");
class JobRegistry {
    static iniciarTodos() {
        mantenimiento_job_1.MantenimientoJob.iniciar();
        anomalias_job_1.AnomaliasJob.iniciar();
    }
}
exports.JobRegistry = JobRegistry;
//# sourceMappingURL=index.js.map