"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envs = void 0;
require("dotenv/config");
const env = __importStar(require("env-var"));
const isDocker = process.env.DB_HOST === "db-fococero";
exports.envs = {
    PORT: env.get("PORT").required().asPortNumber(),
    NODE_ENV: env.get("NODE_ENV").default("development").asString(),
    INTERNAL_SECRET_TOKEN: env.get("INTERNAL_SECRET_TOKEN").required().asString(),
    API_GATEWAY_URL: env.get("API_GATEWAY_URL").required().asString(),
    EUREKA_HOST: env.get("EUREKA_HOST").default("localhost").asString(),
    DB_USER: env.get("DB_USER").required().asString(),
    DB_PASSWORD: env.get("DB_PASSWORD").required().asString(),
    DB_NAME: env.get("DB_NAME").required().asString(),
    DB_HOST: env
        .get(isDocker ? "DB_HOST" : "DB_HOST_LOCAL")
        .required()
        .asString(),
    DB_PORT: env
        .get(isDocker ? "DB_PORT" : "DB_PORT_LOCAL")
        .required()
        .asPortNumber(),
    REDIS_HOST: env
        .get(isDocker ? "REDIS_HOST" : "REDIS_HOST_LOCAL")
        .required()
        .asString(),
    REDIS_PORT: env
        .get(isDocker ? "REDIS_PORT" : "REDIS_PORT_LOCAL")
        .required()
        .asPortNumber(),
    RABBITMQ_URL: env
        .get(isDocker ? "RABBITMQ_URL" : "RABBITMQ_URL_LOCAL")
        .default("amqp://localhost")
        .asString(),
};
//# sourceMappingURL=envs.js.map