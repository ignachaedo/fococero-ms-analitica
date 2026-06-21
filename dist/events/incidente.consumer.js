"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidenteConsumer = void 0;
const rabbitmq_1 = require("../config/rabbitmq");
const ingesta_service_1 = require("../services/ingesta.service");
const logger_helper_1 = require("../helpers/logger.helper");
class IncidenteConsumer {
    static EXCHANGE = "fococero.events";
    static QUEUE = "analitica.incidentes.queue";
    static ROUTING_KEY = "incidente.*";
    static DLX = "fococero.dlx";
    static DLQ = "analitica.incidentes.dlq";
    static async inicializar() {
        const channel = rabbitmq_1.rabbitMQBus.getChannel();
        await channel.assertExchange(this.EXCHANGE, "topic", { durable: true });
        await channel.assertExchange(this.DLX, "topic", { durable: true });
        await channel.assertQueue(this.DLQ, { durable: true });
        await channel.bindQueue(this.DLQ, this.DLX, this.ROUTING_KEY);
        await channel.assertQueue(this.QUEUE, {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": this.DLX,
                "x-dead-letter-routing-key": this.ROUTING_KEY,
            },
        });
        await channel.bindQueue(this.QUEUE, this.EXCHANGE, this.ROUTING_KEY);
        await channel.consume(this.QUEUE, async (msg) => {
            if (!msg)
                return;
            try {
                const payload = JSON.parse(msg.content.toString());
                await ingesta_service_1.ingestaService.procesarEventoIncidente(payload);
                channel.ack(msg);
            }
            catch (error) {
                logger_helper_1.Logger.error('[x] Error al procesar mensaje de incidente', { err: error });
                channel.nack(msg, false, false);
            }
        });
    }
}
exports.IncidenteConsumer = IncidenteConsumer;
//# sourceMappingURL=incidente.consumer.js.map