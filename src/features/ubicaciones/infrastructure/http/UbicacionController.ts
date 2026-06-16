import { NextFunction, Request, Response } from "express";
import { BuscarMunicipiosUseCase } from "../../application/use-cases/BuscarMunicipiosUseCase";
import { ListDepartamentosUseCase } from "../../application/use-cases/ListDepartamentosUseCase";
import { buscarMunicipiosSchema } from "./validators/ubicacionSchemas";

export class UbicacionController {
  constructor(
    private readonly buscarMunicipiosUseCase: BuscarMunicipiosUseCase,
    private readonly listDepartamentosUseCase: ListDepartamentosUseCase
  ) {}

  buscarMunicipios = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const params = buscarMunicipiosSchema.parse(req.query);
      const result = await this.buscarMunicipiosUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  listDepartamentos = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.listDepartamentosUseCase.execute();
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
