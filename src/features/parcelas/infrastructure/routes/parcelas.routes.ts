import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { uploadImagenes } from "@shared/infrastructure/http/middlewares/upload";
import { parcelaController } from "../parcelas.module";

export const parcelasRoutes = Router();

// Todas las rutas de parcelas requieren usuario autenticado.
parcelasRoutes.use(authMiddleware);

parcelasRoutes.post("/", parcelaController.create);
parcelasRoutes.get("/", parcelaController.list);
parcelasRoutes.get("/:id", parcelaController.getById);
parcelasRoutes.put("/:id", parcelaController.update);

// Novedades (reportes de avance) de una parcela.
parcelasRoutes.get("/:id/novedades", parcelaController.listNovedades);
// Acepta `multipart/form-data` con varias imágenes opcionales en `imagenes`.
parcelasRoutes.post(
  "/:id/novedades",
  uploadImagenes,
  parcelaController.registrarNovedad
);
