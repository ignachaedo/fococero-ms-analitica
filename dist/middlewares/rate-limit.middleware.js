"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const redis_1 = require("../config/redis");
const error_helper_1 = require("../helpers/error.helper");
class RateLimitMiddleware {
    static WINDOW_SECS = 60;
    static MAX_REQUESTS = 30;
    static async limit(req, res, next) {
        try {
            const client = redis_1.redisCache["client"];
            const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
            const key = `ratelimit:${ip}`;
            const requests = await client.incr(key);
            if (requests === 1) {
                await client.expire(key, this.WINDOW_SECS);
            }
            res.setHeader("X-RateLimit-Limit", this.MAX_REQUESTS);
            res.setHeader("X-RateLimit-Remaining", Math.max(0, this.MAX_REQUESTS - requests));
            if (requests > this.MAX_REQUESTS) {
                throw new error_helper_1.AppError("Límite de peticiones excedido. Intente nuevamente en un minuto.", 429, "ERR_TOO_MANY_REQUESTS");
            }
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RateLimitMiddleware = RateLimitMiddleware;
//# sourceMappingURL=rate-limit.middleware.js.map