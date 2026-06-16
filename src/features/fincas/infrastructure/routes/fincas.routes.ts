import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { uploadImagen } from "@shared/infrastructure/http/middlewares/upload";
import { fincaController } from "../fincas.module";

export const fincasRoutes = Router();

// Todas las rutas de fincas requieren usuario autenticado.
fincasRoutes.use(authMiddleware);

// create/update aceptan `multipart/form-data` con un campo `imagen` opcional.
fincasRoutes.post("/", uploadImagen, fincaController.create);
fincasRoutes.put("/:id", uploadImagen, fincaController.update);
fincasRoutes.get("/", fincaController.list);
fincasRoutes.get("/buscar", fincaController.buscar);
fincasRoutes.get("/:id/imagen", fincaController.getImagen);
fincasRoutes.get("/:id/resumen", fincaController.resumen);
