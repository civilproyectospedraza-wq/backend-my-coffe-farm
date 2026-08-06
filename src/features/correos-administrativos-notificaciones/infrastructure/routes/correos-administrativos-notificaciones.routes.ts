import { Router } from "express";
import { Rol } from "@features/auth/domain/entities/Rol";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { requireRole } from "@shared/infrastructure/http/middlewares/roleMiddleware";
import { correoAdministrativoNotificacionController } from "../correos-administrativos-notificaciones.module";

export const correosAdministrativosNotificacionesRoutes = Router();

// Configuración interna: solo administradores.
correosAdministrativosNotificacionesRoutes.use(
  authMiddleware,
  requireRole(Rol.Administrador)
);

correosAdministrativosNotificacionesRoutes.post(
  "/",
  correoAdministrativoNotificacionController.create
);
correosAdministrativosNotificacionesRoutes.get(
  "/",
  correoAdministrativoNotificacionController.paginate
);
correosAdministrativosNotificacionesRoutes.put(
  "/:id",
  correoAdministrativoNotificacionController.update
);
