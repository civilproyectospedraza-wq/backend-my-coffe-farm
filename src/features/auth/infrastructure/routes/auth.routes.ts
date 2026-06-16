import { Router } from "express";
import { authMiddleware } from "@shared/infrastructure/http/middlewares/authMiddleware";
import { authController } from "../auth.module";

export const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.get("/validar-auth", authMiddleware, authController.validarAuth);
