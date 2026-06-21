"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esFechaValida = exports.sumar = void 0;
/**
 * Suma dos números de forma tipada.
 */
const sumar = (a, b) => {
    return a + b;
};
exports.sumar = sumar;
/**
 * Valida si un objeto es una instancia de Date válida.
 * Usamos 'unknown' para cumplir con la regla de no usar 'any'.
 */
const esFechaValida = (fecha) => {
    return fecha instanceof Date && !isNaN(fecha.getTime());
};
exports.esFechaValida = esFechaValida;
//# sourceMappingURL=calculadora.js.map