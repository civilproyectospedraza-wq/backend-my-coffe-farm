import { Router } from "express";
import { registroCaficultorController } from "../registro-caficultores.module";

// Ruta pública: el caficultor se registra desde la landing sin autenticación.
export const publicRegistroCaficultoresRoutes = Router();

publicRegistroCaficultoresRoutes.post(
  "/",
  registroCaficultorController.create
);
