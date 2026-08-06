import { Router } from "express";
import { Rol } from "@features/auth/domain/entities/Rol";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { requireRole } from "@shared/infrastructure/http/middlewares/roleMiddleware";
import { solicitudEntregaParcelaController } from "../solicitudes-entregas-parcelas.module";

export const solicitudesEntregasParcelasRoutes = Router();

// Todas las rutas requieren usuario autenticado.
solicitudesEntregasParcelasRoutes.use(authMiddleware);

// Resumen de conteos por estado (`?parcelaId=...&propietarioId=...`, ambos
// opcionales). Va antes de "/" por claridad. El Propietario solo cuenta las
// suyas (scope forzado desde el JWT); el Administrador puede acotar a un
// propietario, que cuenta las solicitudes de las parcelas de sus fincas.
solicitudesEntregasParcelasRoutes.get(
  "/resumen",
  requireRole(Rol.Administrador, Rol.Propietario),
  solicitudEntregaParcelaController.resumen
);

// Listado paginado con filtros opcionales por parcela y estado
// (`?parcelaId=...&estado=pendiente&page=1&limit=10`). Admin y Propietario
// pueden listar; el Propietario solo ve las suyas (scope forzado desde el JWT).
solicitudesEntregasParcelasRoutes.get(
  "/",
  requireRole(Rol.Administrador, Rol.Propietario),
  solicitudEntregaParcelaController.paginate
);

// Solicitudes de una parcela concreta, de la más reciente a la más antigua
// (`/parcela/:parcelaId?estado=pendiente&page=1&limit=10`). Va antes de las
// rutas con parámetro suelto para que no las capture. El Propietario solo ve
// las de sus propias parcelas (scope forzado desde el JWT).
solicitudesEntregasParcelasRoutes.get(
  "/parcela/:parcelaId",
  requireRole(Rol.Administrador, Rol.Propietario),
  solicitudEntregaParcelaController.paginateByParcela
);

// Cambiar el estado de gestión (`{ "estado": "en_gestion" }`). SOLO
// Administrador: el propietario pide, la gestión la mueve el back office.
solicitudesEntregasParcelasRoutes.patch(
  "/:id/estado",
  requireRole(Rol.Administrador),
  solicitudEntregaParcelaController.updateEstado
);

// Crear solicitud. SOLO Propietario: la solicitud queda a nombre del dueño del
// JWT y solo sobre parcelas de sus propias fincas.
solicitudesEntregasParcelasRoutes.post(
  "/",
  requireRole(Rol.Propietario),
  solicitudEntregaParcelaController.create
);
