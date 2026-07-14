import { Router } from "express";
import { propietarioController } from "../propietarios.module";

// Rutas públicas: el propietario se registra y activa su cuenta desde la
// landing, sin autenticación.
export const publicPropietariosRoutes = Router();

// Registro público: crea el propietario en estado `pendiente` y envía el
// correo con el enlace de activación.
publicPropietariosRoutes.post("/", propietarioController.registrar);

// Activación: confirma la cuenta con el token del correo y define la contraseña.
publicPropietariosRoutes.post("/activar", propietarioController.activar);
