import cron from "node-cron";
import { mantenimientoService } from "../services/mantenimiento.service";
import { logger } from "../config/logger";

export class MantenimientoJob {
  public static iniciar(): void {
    cron.schedule("0 3 * * *", async () => {
      try {
        await mantenimientoService.sincronizarDatosBase();
      } catch (error) {
        logger.error(
          `[CRON ERROR] ${new Date().toISOString()} - ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
  }
}
