import cors from "cors";
import express, { Application, Request, Response } from "express";
import { apiRoutes } from "../routes/index.routes";
import { errorHandler } from "./middlewares/errorHandler";

export function createServer(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/api", apiRoutes);

  app.use(errorHandler);

  return app;
}
