import { Router } from "express";
import { Rol } from "@features/auth/domain/entities/Rol";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { requireRole } from "@shared/infrastructure/http/middlewares/roleMiddleware";
import { uploadImagen } from "@shared/infrastructure/http/middlewares/upload";
import { entregaController } from "../entregas.module";

export const entregasRoutes = Router();

// Todas las rutas de entregas requieren usuario autenticado.
entregasRoutes.use(authMiddleware);

// Listado paginado con filtro opcional por suscripción
// (`?suscripcionId=...&page=1&limit=10`). Admin y Propietario pueden listar;
// el Propietario solo ve las suyas (scope forzado desde el JWT).
entregasRoutes.get("/", entregaController.paginate);

// create/update aceptan `multipart/form-data` con un campo `imagen` opcional
// (el comprobante de pago). SOLO Administrador: un Propietario recibe 403.
entregasRoutes.post(
  "/",
  requireRole(Rol.Administrador),
  uploadImagen,
  entregaController.create
);
entregasRoutes.put(
  "/:id",
  requireRole(Rol.Administrador),
  uploadImagen,
  entregaController.update
);
