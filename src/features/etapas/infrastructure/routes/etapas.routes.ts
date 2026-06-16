import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { etapaController } from "../etapas.module";

export const etapasRoutes = Router();

// Todas las rutas de etapas requieren usuario autenticado.
etapasRoutes.use(authMiddleware);

etapasRoutes.post("/", etapaController.create);
etapasRoutes.get("/", etapaController.list);
etapasRoutes.get("/buscar", etapaController.buscar);
etapasRoutes.put("/:id", etapaController.update);
