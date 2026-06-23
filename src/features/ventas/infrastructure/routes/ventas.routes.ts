import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { ventaController } from "../ventas.module";

export const ventasRoutes = Router();

// Crear una venta es PÚBLICO: el comprador aún no es un usuario registrado (la
// cuenta se crea al confirmarse el pago). Guarda los datos del comprador y
// devuelve la URL de pago de Stripe.
ventasRoutes.post("/", ventaController.create);

// Listado paginado de ventas (administración): requiere auth.
ventasRoutes.get("/", authMiddleware, ventaController.list);

// Completación manual (admin/offline) sin pasar por Stripe: requiere auth.
ventasRoutes.post("/:id/completar", authMiddleware, ventaController.completar);
