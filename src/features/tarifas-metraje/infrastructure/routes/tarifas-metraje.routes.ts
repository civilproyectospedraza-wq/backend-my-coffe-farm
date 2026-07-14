import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { tarifaMetrajeController } from "../tarifas-metraje.module";

export const tarifasMetrajeRoutes = Router();

// Todas las rutas de tarifas de metraje requieren usuario autenticado.
tarifasMetrajeRoutes.use(authMiddleware);

tarifasMetrajeRoutes.post("/", tarifaMetrajeController.create);
tarifasMetrajeRoutes.get("/", tarifaMetrajeController.list);
// Todas las tarifas sin paginar (para el selector de crear/editar parcela).
// Debe ir antes de "/:id" para no colisionar con la validación de uuid.
tarifasMetrajeRoutes.get("/all", tarifaMetrajeController.listAll);
tarifasMetrajeRoutes.get("/:id", tarifaMetrajeController.getById);
// Historial completo de versiones de la tarifa (más reciente primero).
tarifasMetrajeRoutes.get(
  "/:id/versiones",
  tarifaMetrajeController.getHistorial
);
// Reemplazo del "actualizar": se crea una versión nueva y se asigna como actual.
tarifasMetrajeRoutes.post(
  "/:id/versiones",
  tarifaMetrajeController.createVersion
);
