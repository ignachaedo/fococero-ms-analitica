"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictivaController = exports.PredictivaController = void 0;
const predictiva_service_1 = require("../services/predictiva.service");
const analitica_validator_1 = require("../validators/analitica.validator");
const respuesta_http_transformer_1 = require("../transformers/respuesta-http.transformer");
const catch_async_helper_1 = require("../helpers/catch-async.helper");
class PredictivaController {
    obtenerPronostico = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        const data = await predictiva_service_1.predictivaService.generarPronostico(params);
        res
            .status(200)
            .json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, "Pronóstico predictivo generado"));
    });
}
exports.PredictivaController = PredictivaController;
exports.predictivaController = new PredictivaController();
//# sourceMappingURL=predictiva.controller.js.map