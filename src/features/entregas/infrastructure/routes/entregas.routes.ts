import { Router } from "express";
import { Rol } from "@features/auth/domain/entities/Rol";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { requireRole } from "@shared/infrastructure/http/middlewares/roleMiddleware";
import { uploadImagen } from "@shared/infrastructure/http/middlewares/upload";
import { entregaController } from "../entregas.module";

export const entregasRoutes = Router();

// Todas las rutas de entregas requieren usuario autenticado.
entregasRoutes.use(authMiddleware);

// Listado paginado con filtros opcionales por parcela, suscripción o solicitud
// (`?parcelaId=...&page=1&limit=10`). Admin y Propietario pueden listar;
// el Propietario solo ve las suyas (scope forzado desde el JWT).
entregasRoutes.get("/", entregaController.paginate);

// Registrar la entrega que atiende una solicitud `en_gestion`: el admin
// rectifica los datos reales (cantidad entregada, valor pagado) y adjunta el
// comprobante. Al crearse, la solicitud queda `gestionada`.
// create/update aceptan `multipart/form-data` con un campo `imagen` opcional
// (el comprobante de pago). SOLO Administrador: un Propietario recibe 403.
entregasRoutes.post(
  "/crear-entrega",
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
