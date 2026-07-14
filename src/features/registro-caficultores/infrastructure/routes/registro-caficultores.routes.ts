import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { requireRole } from "@shared/infrastructure/http/middlewares/roleMiddleware";
import { Rol } from "@features/auth/domain/entities/Rol";
import { registroCaficultorController } from "../registro-caficultores.module";

// Gestión de solicitudes: solo administradores autenticados.
export const registroCaficultoresRoutes = Router();

registroCaficultoresRoutes.use(authMiddleware, requireRole(Rol.Administrador));

registroCaficultoresRoutes.get("/", registroCaficultorController.list);
registroCaficultoresRoutes.patch(
  "/:id/aprobar",
  registroCaficultorController.aprobar
);
registroCaficultoresRoutes.patch(
  "/:id/rechazar",
  registroCaficultorController.rechazar
);
