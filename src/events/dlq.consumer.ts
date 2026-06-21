import { rabbitMQBus } from "../config/rabbitmq";
import { Logger } from "../helpers/logger.helper";

export class DlqConsumer {
  private static readonly DLQ = "analitica.incidentes.dlq";

  public static async inicializar(): Promise<void> {
    const channel = rabbitMQBus.getChannel();

    await channel.assertQueue(this.DLQ, { durable: true });

    await channel.consume(this.DLQ, async (msg) => {
      if (!msg) return;

      try {
        const payload = msg.content.toString();
        const headers = msg.properties.headers || {};
        const reason = headers["x-first-death-reason"] || "UNKNOWN_ERROR";
        const originalQueue = headers["x-first-death-queue"] || "UNKNOWN_QUEUE";

        Logger.error(
          '[CRÍTICO - DLQ] Mensaje fallido drenado',
          { originalQueue, reason, payload },
        );

        channel.ack(msg);
      } catch (error) {
        Logger.error(
          '[FATAL] Fallo al procesar mensaje de DLQ. Reencolando...',
          { err: error },
        );
        channel.nack(msg, false, true);
      }
    });
  }
}
