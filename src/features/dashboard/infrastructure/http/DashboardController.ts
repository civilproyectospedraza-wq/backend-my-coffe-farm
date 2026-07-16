import { NextFunction, Request, Response } from "express";
import { resolvePropietarioScope } from "@shared/infrastructure/http/propietarioScope";
import { GetResumenDashboardUseCase } from "../../application/use-cases/GetResumenDashboardUseCase";

export class DashboardController {
  constructor(
    private readonly getResumenDashboardUseCase: GetResumenDashboardUseCase
  ) {}

  resumen = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Scope desde el JWT: un Propietario ve solo lo suyo; un Admin, todo.
      const propietarioId = resolvePropietarioScope(req);
      const result = await this.getResumenDashboardUseCase.execute({
        propietarioId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
