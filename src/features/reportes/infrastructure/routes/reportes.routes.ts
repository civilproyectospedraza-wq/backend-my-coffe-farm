import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { uploadImagenes } from "@shared/infrastructure/http/middlewares/upload";
import { reporteController } from "../reportes.module";

export const reportesRoutes = Router();

// Todas las rutas de reportes requieren usuario autenticado.
reportesRoutes.use(authMiddleware);

// Listado paginado con filtro opcional por parcela
// (`?parcelaId=...&page=1&limit=10`).
reportesRoutes.get("/", reporteController.paginate);

// Crear reporte. Acepta `multipart/form-data` con `parcelaId` y varias
// imágenes opcionales en el campo `imagenes`.
reportesRoutes.post("/", uploadImagenes, reporteController.create);
