import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { propietarioController } from "../propietarios.module";

export const propietariosRoutes = Router();

// Todas las rutas de propietarios requieren usuario autenticado.
propietariosRoutes.use(authMiddleware);

propietariosRoutes.post("/", propietarioController.create);
propietariosRoutes.get("/", propietarioController.list);
