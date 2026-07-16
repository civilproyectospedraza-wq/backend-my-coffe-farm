import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { dashboardController } from "../dashboard.module";

export const dashboardRoutes = Router();

// El panel requiere usuario autenticado. Admin y Propietario pueden verlo; el
// alcance de los datos se resuelve desde el JWT (Propietario = lo suyo).
dashboardRoutes.use(authMiddleware);

dashboardRoutes.get("/resumen", dashboardController.resumen);
