/**
 * Suma dos números de forma tipada.
 *
 * @param a - Primer sumando
 * @param b - Segundo sumando
 * @returns Resultado de la suma
 */
export const sumar = (a: number, b: number): number => {
  return a + b;
};

/**
 * Valida si un objeto es una instancia de Date válida (no NaN).
 *
 * @param fecha - Valor a validar (se espera Date o unknown)
 * @returns true si es una instancia de Date válida
 */
export const esFechaValida = (fecha: unknown): boolean => {
  return fecha instanceof Date && !isNaN(fecha.getTime());
};
