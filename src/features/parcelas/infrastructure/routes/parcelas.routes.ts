import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { uploadImagenes } from "@shared/infrastructure/http/middlewares/upload";
import { parcelaController } from "../parcelas.module";

export const parcelasRoutes = Router();

// Todas las rutas de parcelas requieren usuario autenticado.
parcelasRoutes.use(authMiddleware);

// Crear parcela acepta `multipart/form-data`: las imágenes de portada
// (opcionales) llegan en el campo `imagenes`.
parcelasRoutes.post("/", uploadImagenes, parcelaController.create);
parcelasRoutes.get("/", parcelaController.list);
parcelasRoutes.get("/:id", parcelaController.getById);
// Actualizar también acepta `multipart/form-data`: si llegan imágenes en el
// campo `imagenes`, reemplazan la portada de la parcela.
parcelasRoutes.put("/:id", uploadImagenes, parcelaController.update);
