import { NextFunction, Request, Response } from "express";
import { CreateTarifaMetrajeUseCase } from "../../application/use-cases/CreateTarifaMetrajeUseCase";
import { CreateTarifaMetrajeVersionUseCase } from "../../application/use-cases/CreateTarifaMetrajeVersionUseCase";
import { GetTarifaMetrajeUseCase } from "../../application/use-cases/GetTarifaMetrajeUseCase";
import { ListAllTarifasMetrajeUseCase } from "../../application/use-cases/ListAllTarifasMetrajeUseCase";
import { ListTarifasMetrajeUseCase } from "../../application/use-cases/ListTarifasMetrajeUseCase";
import {
  createTarifaMetrajeSchema,
  createTarifaMetrajeVersionSchema,
  listTarifasMetrajeSchema,
  tarifaMetrajeIdParamSchema,
} from "./validators/tarifaMetrajeSchemas";

export class TarifaMetrajeController {
  constructor(
    private readonly createTarifaMetrajeUseCase: CreateTarifaMetrajeUseCase,
    private readonly listTarifasMetrajeUseCase: ListTarifasMetrajeUseCase,
    private readonly createTarifaMetrajeVersionUseCase: CreateTarifaMetrajeVersionUseCase,
    private readonly getTarifaMetrajeUseCase: GetTarifaMetrajeUseCase,
    private readonly listAllTarifasMetrajeUseCase: ListAllTarifasMetrajeUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createTarifaMetrajeSchema.parse(req.body);
      const tarifa = await this.createTarifaMetrajeUseCase.execute({
        ...data,
        createdBy: req.user?.id ?? null,
      });
      return res.status(201).json(tarifa);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listTarifasMetrajeSchema.parse(req.query);
      const result = await this.listTarifasMetrajeUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  listAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tarifas = await this.listAllTarifasMetrajeUseCase.execute();
      return res.status(200).json(tarifas);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = tarifaMetrajeIdParamSchema.parse(req.params);
      const tarifa = await this.getTarifaMetrajeUseCase.execute(id);
      return res.status(200).json(tarifa);
    } catch (error) {
      return next(error);
    }
  };

  createVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = tarifaMetrajeIdParamSchema.parse(req.params);
      const data = createTarifaMetrajeVersionSchema.parse(req.body);
      const version = await this.createTarifaMetrajeVersionUseCase.execute(id, {
        ...data,
        createdBy: req.user?.id ?? null,
      });
      return res.status(201).json(version);
    } catch (error) {
      return next(error);
    }
  };
}
