"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEureka = exports.eurekaClient = void 0;
const eureka_js_client_1 = require("eureka-js-client");
const envs_1 = require("./envs");
const logger_helper_1 = require("../helpers/logger.helper");
// Configuración centralizada de la instancia
exports.eurekaClient = new eureka_js_client_1.Eureka({
    instance: {
        app: 'ms-analitica',
        hostName: process.env.HOSTNAME || 'ms-analitica',
        ipAddr: '127.0.0.1',
        // URL de salud configurada en app.ts
        statusPageUrl: `http://${process.env.HOSTNAME || 'ms-analitica'}:${envs_1.envs.PORT}/health`,
        port: {
            '$': envs_1.envs.PORT,
            '@enabled': true,
        },
        vipAddress: 'ms-analitica',
        dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
        },
    },
    eureka: {
        host: process.env.EUREKA_HOST || 'eureka-server',
        port: parseInt(process.env.EUREKA_PORT || '8761', 10),
        servicePath: '/eureka/apps/',
    },
});
/**
 * Inicializa la conexión con el servidor de descubrimiento.
 * Implementa reintentos automáticos por defecto de la librería.
 */
const initEureka = () => {
    exports.eurekaClient.start((error) => {
        if (error) {
            logger_helper_1.Logger.error('❌ [EUREKA] Fallo crítico en el registro:', { error: error.message });
        }
        else {
            logger_helper_1.Logger.info('✅ [EUREKA] Microservicio registrado en la malla con éxito.');
        }
    });
};
exports.initEureka = initEureka;
//# sourceMappingURL=eureka.js.map