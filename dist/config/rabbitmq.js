"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitMQBus = void 0;
const amqplib_1 = require("amqplib");
const envs_1 = require("./envs");
const logger_helper_1 = require("../helpers/logger.helper");
class RabbitMQBus {
    static instance;
    connection = null;
    channel = null;
    isConnecting = false;
    reconnectTimeout = null;
    constructor() { }
    static getInstance() {
        if (!RabbitMQBus.instance) {
            RabbitMQBus.instance = new RabbitMQBus();
        }
        return RabbitMQBus.instance;
    }
    async connect() {
        if (this.isConnecting || (this.connection && this.channel))
            return;
        this.isConnecting = true;
        try {
            const conn = await (0, amqplib_1.connect)(envs_1.envs.RABBITMQ_URL);
            const ch = await conn.createChannel();
            conn.on("error", (err) => {
                logger_helper_1.Logger.error("🔥 [RabbitMQ] Error de conexión:", err);
                this.scheduleReconnect();
            });
            conn.on("close", () => {
                logger_helper_1.Logger.warn("⚠️ [RabbitMQ] Conexión cerrada. Reconectando...");
                this.scheduleReconnect();
            });
            // Escuchar eventos del canal
            ch.on("error", (err) => {
                logger_helper_1.Logger.error("🔥 [RabbitMQ] Error en el canal:", err);
                this.scheduleReconnect();
            });
            ch.on("close", () => {
                logger_helper_1.Logger.warn("⚠️ [RabbitMQ] Canal cerrado. Reconectando...");
                this.scheduleReconnect();
            });
            // Asignación limpia sin errores de tipado
            this.connection = conn;
            this.channel = ch;
            logger_helper_1.Logger.info("🐇 RabbitMQ [Event Bus] Conectado Exitosamente");
        }
        catch (error) {
            logger_helper_1.Logger.error("❌ [RabbitMQ] Falla inicial. Reintentando...", error);
            this.scheduleReconnect();
        }
        finally {
            this.isConnecting = false;
        }
    }
    scheduleReconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        // Ahora TypeScript sabe perfectamente que 'ChannelModel' tiene el método close()
        if (this.connection) {
            this.connection.close().catch(() => { });
        }
        this.connection = null;
        this.channel = null;
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect().catch((err) => {
                logger_helper_1.Logger.error("Error crítico al reconectar RabbitMQ:", err);
            });
        }, 5000);
    }
    getChannel() {
        if (!this.channel) {
            throw new Error("RabbitMQ Channel no inicializado. Llama a connect() primero.");
        }
        return this.channel;
    }
}
exports.rabbitMQBus = RabbitMQBus.getInstance();
//# sourceMappingURL=rabbitmq.js.map