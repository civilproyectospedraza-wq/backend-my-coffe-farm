import express, { Router } from "express";
import { ventaController } from "../ventas.module";

/**
 * Router del webhook de Stripe. Usa `express.raw` porque la verificación de la
 * firma necesita el body sin parsear. Se monta en server.ts ANTES de
 * `express.json()` para que el parser global no consuma el cuerpo.
 */
export const stripeWebhookRouter = Router();

stripeWebhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  ventaController.webhook
);
