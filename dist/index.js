"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const envs_1 = require("./config/envs");
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const rabbitmq_1 = require("./config/rabbitmq");
const eureka_1 = require("./config/eureka");
const events_1 = require("./events");
const logger_helper_1 = require("./helpers/logger.helper");
const PORT = envs_1.envs.PORT || 3007;
/**
 * Función principal de arranque (Bootstrap)
 */
async function bootstrap() {
    try {
        logger_helper_1.Logger.info(`====================================================`);
        logger_helper_1.Logger.info(`📊 INICIANDO MS-ANALITICA (FocoCero Process)`);
        logger_helper_1.Logger.info(`====================================================`);
        // 1. Verificación de Salud de la Infraestructura
        await (0, db_1.checkDbConnection)();
        logger_helper_1.Logger.info(`✅ [POSTGRES] Conexión establecida.`);
        // 2. Conexión al Bus de Eventos (RabbitMQ)
        await rabbitmq_1.rabbitMQBus.connect();
        logger_helper_1.Logger.info(`✅ [RABBITMQ] Bus de eventos conectado.`);
        // 3. Inicialización de Consumidores de Eventos
        await events_1.EventRegistry.inicializarTodos();
        logger_helper_1.Logger.info(`✅ [EVENTS] Consumidores de eventos iniciados.`);
        // 4. Encendido del Servidor
        const server = app_1.default.listen(PORT, () => {
            logger_helper_1.Logger.info(`🚀 [SERVER] Escuchando en puerto: ${PORT}`);
            logger_helper_1.Logger.info(`📡 [ENV] Modo: ${envs_1.envs.NODE_ENV}`);
            logger_helper_1.Logger.info(`📖 [DOCS] http://localhost:${PORT}/api/v1/analitica/docs`);
            // 5. Registro en Service Discovery
            (0, eureka_1.initEureka)();
        });
        // ============================================================================
        // 🛑 GESTIÓN DE CIERRE CONTROLADO (ORQUESTACIÓN SENIOR)
        // ============================================================================
        const handleShutdown = async (signal) => {
            logger_helper_1.Logger.info(`⚠️  [${signal}] Señal de apagado recibida. Iniciando Graceful Shutdown...`);
            // Paso A: Retirarse de Eureka (Inmediato para el Gateway)
            eureka_1.eurekaClient.stop((eurekaError) => {
                if (eurekaError)
                    logger_helper_1.Logger.error("❌ [EUREKA] Error al desregistrar:", eurekaError);
                else
                    logger_helper_1.Logger.info("✅ [EUREKA] Retirado de la malla de servicios.");
                // Paso B: Dejar de aceptar nuevas conexiones HTTP
                server.close(async () => {
                    logger_helper_1.Logger.info("✅ [SERVER] Servidor HTTP detenido.");
                    try {
                        // Paso C: Cerrar Redis (Usa el wrapper del index original)
                        const wrapper = redis_1.redisCache;
                        if (wrapper.client?.quit) {
                            await wrapper.client.quit();
                            logger_helper_1.Logger.info("✅ [REDIS] Conexión cerrada.");
                        }
                        // Paso D: Cerrar PostgreSQL
                        await db_1.dbPool.end();
                        logger_helper_1.Logger.info("✅ [POSTGRES] Pool de conexiones liberado.");
                        logger_helper_1.Logger.info("👋 [SISTEMA] Apagado completado de forma segura.");
                        process.exit(0);
                    }
                    catch (err) {
                        logger_helper_1.Logger.error("❌ [ERROR] Fallo durante el cierre de recursos:", err);
                        process.exit(1);
                    }
                });
            });
            // Timeout de seguridad: Si no cierra en 10s, forzar salida
            setTimeout(() => {
                logger_helper_1.Logger.error("🔥 [FATAL] El cierre tardó demasiado. Forzando salida.");
                process.exit(1);
            }, 10000);
        };
        process.on("SIGINT", () => handleShutdown("SIGINT"));
        process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    }
    catch (criticalError) {
        const errorMsg = criticalError instanceof Error ? criticalError.message : String(criticalError);
        logger_helper_1.Logger.error(`❌ [FATAL] Error durante el arranque: ${errorMsg}`, criticalError);
        process.exit(1);
    }
}
// Ejecutar el proceso
bootstrap();
//# sourceMappingURL=index.js.map