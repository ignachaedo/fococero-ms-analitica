"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggerMiddleware = void 0;
const logger_helper_1 = require("../helpers/logger.helper");
class RequestLoggerMiddleware {
    static log(req, res, next) {
        const start = Date.now();
        res.on("finish", () => {
            const duration = Date.now() - start;
            const message = `${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`;
            if (res.statusCode >= 500) {
                logger_helper_1.Logger.error(message, { ip: req.ip, body: req.body });
            }
            else if (res.statusCode >= 400) {
                logger_helper_1.Logger.warn(message, { ip: req.ip });
            }
            else {
                logger_helper_1.Logger.info(message, { ip: req.ip });
            }
        });
        next();
    }
}
exports.RequestLoggerMiddleware = RequestLoggerMiddleware;
//# sourceMappingURL=request-logger.middleware.js.map