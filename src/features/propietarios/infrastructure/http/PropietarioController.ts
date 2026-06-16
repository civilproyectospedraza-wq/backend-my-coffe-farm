import { NextFunction, Request, Response } from "express";
import { CreatePropietarioUseCase } from "../../application/use-cases/CreatePropietarioUseCase";
import { ListPropietariosUseCase } from "../../application/use-cases/ListPropietariosUseCase";
import {
  createPropietarioSchema,
  listPropietariosSchema,
} from "./validators/propietarioSchemas";

export class PropietarioController {
  constructor(
    private readonly createPropietarioUseCase: CreatePropietarioUseCase,
    private readonly listPropietariosUseCase: ListPropietariosUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createPropietarioSchema.parse(req.body);
      const propietario = await this.createPropietarioUseCase.execute(data);
      return res.status(201).json(propietario);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listPropietariosSchema.parse(req.query);
      const result = await this.listPropietariosUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
