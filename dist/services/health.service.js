"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthService = void 0;
const db_1 = require("../config/db");
const redis_1 = require("../config/redis");
const rabbitmq_1 = require("../config/rabbitmq");
class HealthService {
    async check() {
        let dbStatus;
        let redisStatus;
        let mqStatus;
        try {
            await db_1.dbPool.query("SELECT 1");
            dbStatus = "UP";
        }
        catch {
            dbStatus = "DOWN";
        }
        try {
            const client = redis_1.redisCache["client"];
            redisStatus = client && client.isOpen ? "UP" : "DOWN";
        }
        catch {
            redisStatus = "DOWN";
        }
        try {
            const channel = rabbitmq_1.rabbitMQBus.getChannel();
            mqStatus = channel ? "UP" : "DOWN";
        }
        catch {
            mqStatus = "DOWN";
        }
        const allUp = dbStatus === "UP" && redisStatus === "UP" && mqStatus === "UP";
        const allDown = dbStatus === "DOWN" && redisStatus === "DOWN" && mqStatus === "DOWN";
        return {
            status: allUp ? "OK" : allDown ? "DOWN" : "DEGRADED",
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                redis: redisStatus,
                rabbitmq: mqStatus,
            },
        };
    }
    async getMetrics() {
        const memoryUsage = process.memoryUsage();
        return ([
            "# HELP process_resident_memory_bytes Resident memory size in bytes.",
            "# TYPE process_resident_memory_bytes gauge",
            `process_resident_memory_bytes ${memoryUsage.rss}`,
            "# HELP process_heap_total_bytes Total heap size in bytes.",
            "# TYPE process_heap_total_bytes gauge",
            `process_heap_total_bytes ${memoryUsage.heapTotal}`,
            "# HELP process_heap_used_bytes Used heap size in bytes.",
            "# TYPE process_heap_used_bytes gauge",
            `process_heap_used_bytes ${memoryUsage.heapUsed}`,
        ].join("\n") + "\n");
    }
}
exports.healthService = new HealthService();
//# sourceMappingURL=health.service.js.map