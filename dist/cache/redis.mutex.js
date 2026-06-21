"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisMutex = void 0;
const redis_1 = require("../config/redis");
class RedisMutex {
    static LOCK_PREFIX = "lock:";
    static DEFAULT_RETRY_DELAY_MS = 50;
    static MAX_RETRIES = 100;
    static async adquirirBloqueo(recursoId, ttlSegundos = 10) {
        const lockKey = `${this.LOCK_PREFIX}${recursoId}`;
        const client = redis_1.redisCache["client"];
        const lockAcquired = await client.set(lockKey, "LOCKED", {
            NX: true,
            EX: ttlSegundos,
        });
        return lockAcquired !== null;
    }
    static async liberarBloqueo(recursoId) {
        const lockKey = `${this.LOCK_PREFIX}${recursoId}`;
        const client = redis_1.redisCache["client"];
        await client.del(lockKey);
    }
    static async esperarBloqueo(recursoId) {
        let intentos = 0;
        while (intentos < this.MAX_RETRIES) {
            const lockKey = `${this.LOCK_PREFIX}${recursoId}`;
            const client = redis_1.redisCache["client"];
            const estaBloqueado = await client.get(lockKey);
            if (!estaBloqueado) {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, this.DEFAULT_RETRY_DELAY_MS));
            intentos++;
        }
        throw new Error(`Timeout esperando liberación del candado para el recurso: ${recursoId}`);
    }
}
exports.RedisMutex = RedisMutex;
//# sourceMappingURL=redis.mutex.js.map