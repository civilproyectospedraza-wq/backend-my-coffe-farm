import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { uploadImagenes } from "@shared/infrastructure/http/middlewares/upload";
import { novedadController } from "../novedades.module";

export const novedadesRoutes = Router();

// Todas las rutas de novedades requieren usuario autenticado.
novedadesRoutes.use(authMiddleware);

// Listado paginado con filtro opcional por parcela
// (`?parcelaId=...&page=1&limit=10`).
novedadesRoutes.get("/", novedadController.paginate);

// Crear novedad. Acepta `multipart/form-data` con `parcelaId` y varias
// imágenes opcionales en el campo `imagenes`.
novedadesRoutes.post("/", uploadImagenes, novedadController.create);
