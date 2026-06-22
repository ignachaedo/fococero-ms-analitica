/**
 * @fileoverview Transformador de respuestas HTTP estandarizadas.
 * Garantiza que todas las respuestas del API tengan una estructura
 * consistente con campos exito, mensaje, datos y timestamp.
 */
export class RespuestaHttpTransformer {
  /**
   * Crea una respuesta de éxito estandarizada.
   *
   * @param datos - Datos a incluir en la respuesta
   * @param mensaje - Mensaje descriptivo (opcional)
   * @returns Objeto con exito: true, mensaje, datos y timestamp
   */
  public static exito<T>(datos: T, mensaje = "Operación completada con éxito") {
    return {
      exito: true,
      mensaje,
      datos,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Crea una respuesta de éxito paginada.
   *
   * @param datos - Array de datos de la página actual
   * @param total - Total de registros disponibles
   * @param pagina - Número de página actual
   * @param limite - Registros por página
   * @returns Objeto con datos, metadatos de paginación y timestamp
   */
  public static paginada<T>(
    datos: T[],
    total: number,
    pagina: number,
    limite: number,
  ) {
    const totalPaginas = Math.ceil(total / limite);
    return {
      exito: true,
      mensaje: "Datos recuperados exitosamente",
      datos,
      meta: {
        totalRegistros: total,
        paginaActual: pagina,
        totalPaginas,
        tieneMas: pagina < totalPaginas,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Crea una respuesta de error estandarizada.
   *
   * @param mensaje - Mensaje descriptivo del error
   * @param codigo - Código interno del error
   * @param detalles - Detalles adicionales (opcional, para errores de validación)
   * @returns Objeto con exito: false, error, y timestamp
   */
  public static error(mensaje: string, codigo: string, detalles?: unknown) {
    return {
      exito: false,
      error: {
        codigo,
        mensaje,
        detalles,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
