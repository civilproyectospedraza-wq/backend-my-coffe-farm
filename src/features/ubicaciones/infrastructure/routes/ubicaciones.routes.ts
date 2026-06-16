import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { ubicacionController } from "../ubicaciones.module";

export const ubicacionesRoutes = Router();

// Catálogo de ubicaciones: requiere usuario autenticado (igual que etapas).
ubicacionesRoutes.use(authMiddleware);

ubicacionesRoutes.get("/departamentos", ubicacionController.listDepartamentos);
ubicacionesRoutes.get("/municipios", ubicacionController.buscarMunicipios);
