"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAuthMiddleware = void 0;
const envs_1 = require("../config/envs");
const internalAuthMiddleware = (req, res, next) => {
    if (req.path === "/health" ||
        req.path === "/metrics" ||
        req.path.startsWith("/api/analitica") ||
        req.path.startsWith("/api/v1/analitica")) {
        return next();
    }
    const internalToken = req.headers["x-internal-token"];
    if (!internalToken || internalToken !== envs_1.envs.INTERNAL_SECRET_TOKEN) {
        res.status(401).json({
            ok: false,
            error: "Acceso denegado: Petición interna no autorizada.",
        });
        return;
    }
    next();
};
exports.internalAuthMiddleware = internalAuthMiddleware;
//# sourceMappingURL=internalAuth.middleware.js.map