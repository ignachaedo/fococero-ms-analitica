"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DlqConsumer = void 0;
const rabbitmq_1 = require("../config/rabbitmq");
const logger_helper_1 = require("../helpers/logger.helper");
class DlqConsumer {
    static DLQ = "analitica.incidentes.dlq";
    static async inicializar() {
        const channel = rabbitmq_1.rabbitMQBus.getChannel();
        await channel.assertQueue(this.DLQ, { durable: true });
        await channel.consume(this.DLQ, async (msg) => {
            if (!msg)
                return;
            try {
                const payload = msg.content.toString();
                const headers = msg.properties.headers || {};
                const reason = headers["x-first-death-reason"] || "UNKNOWN_ERROR";
                const originalQueue = headers["x-first-death-queue"] || "UNKNOWN_QUEUE";
                logger_helper_1.Logger.error('[CRÍTICO - DLQ] Mensaje fallido drenado', { originalQueue, reason, payload });
                channel.ack(msg);
            }
            catch (error) {
                logger_helper_1.Logger.error('[FATAL] Fallo al procesar mensaje de DLQ. Reencolando...', { err: error });
                channel.nack(msg, false, true);
            }
        });
    }
}
exports.DlqConsumer = DlqConsumer;
//# sourceMappingURL=dlq.consumer.js.map