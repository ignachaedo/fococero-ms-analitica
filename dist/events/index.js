"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRegistry = void 0;
const incidente_consumer_1 = require("./incidente.consumer");
const dlq_consumer_1 = require("./dlq.consumer");
class EventRegistry {
    static async inicializarTodos() {
        await incidente_consumer_1.IncidenteConsumer.inicializar();
        await dlq_consumer_1.DlqConsumer.inicializar();
    }
}
exports.EventRegistry = EventRegistry;
//# sourceMappingURL=index.js.map