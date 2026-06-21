"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
// src/helpers/logger.helper.ts
const pino_1 = __importDefault(require("pino"));
const pinoLogger = (0, pino_1.default)({
    level: process.env.NODE_ENV === "test" ? "silent" : "info",
    transport: process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
});
class Logger {
    static info(message, meta) {
        pinoLogger.info(meta, message);
    }
    static warn(message, meta) {
        pinoLogger.warn(meta, message);
    }
    static error(message, meta) {
        pinoLogger.error(meta, message);
    }
    static debug(message, meta) {
        pinoLogger.debug(meta, message);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.helper.js.map