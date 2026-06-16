import { Router } from "express";
import { publicParcelaController } from "../parcelas.module";

// Rutas públicas: el visitante navega el catálogo antes de registrarse,
// por eso NO se aplica authMiddleware.
export const publicParcelasRoutes = Router();

publicParcelasRoutes.get("/", publicParcelaController.list);
publicParcelasRoutes.get("/:id", publicParcelaController.getById);
