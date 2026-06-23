import cors from "cors";
import express, { Application, Request, Response } from "express";
import { stripeWebhookRouter } from "@features/ventas/infrastructure/routes/stripe-webhook.routes";
import { apiRoutes } from "../routes/index.routes";
import { errorHandler } from "./middlewares/errorHandler";

export function createServer(): Application {
  const app = express();

  app.use(cors());

  // El webhook de Stripe necesita el body crudo para verificar la firma, por eso
  // se monta ANTES del parser JSON global.
  app.use("/api/ventas/stripe", stripeWebhookRouter);

  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/api", apiRoutes);

  app.use(errorHandler);

  return app;
}
