"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ops_routes_1 = require("./ops.routes");
const core_routes_1 = require("./core.routes");
const espacial_routes_1 = require("./espacial.routes");
const filtros_routes_1 = require("./filtros.routes");
const exportar_routes_1 = require("./exportar.routes");
const predictiva_routes_1 = require("./predictiva.routes");
const apiRouter = (0, express_1.Router)();
apiRouter.use("/ops", ops_routes_1.opsRoutes);
apiRouter.use("/core", core_routes_1.coreRoutes);
apiRouter.use("/espacial", espacial_routes_1.espacialRoutes);
apiRouter.use("/filtros", filtros_routes_1.filtrosRoutes);
apiRouter.use("/exportar", exportar_routes_1.exportarRoutes);
apiRouter.use("/predictiva", predictiva_routes_1.predictivaRoutes);
exports.default = apiRouter;
//# sourceMappingURL=index.js.map