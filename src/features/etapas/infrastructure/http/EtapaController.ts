import { NextFunction, Request, Response } from "express";
import { BuscarEtapasUseCase } from "../../application/use-cases/BuscarEtapasUseCase";
import { CreateEtapaUseCase } from "../../application/use-cases/CreateEtapaUseCase";
import { ListEtapasUseCase } from "../../application/use-cases/ListEtapasUseCase";
import { UpdateEtapaUseCase } from "../../application/use-cases/UpdateEtapaUseCase";
import {
  buscarEtapasSchema,
  createEtapaSchema,
  etapaIdParamSchema,
  listEtapasSchema,
  updateEtapaSchema,
} from "./validators/etapaSchemas";

export class EtapaController {
  constructor(
    private readonly createEtapaUseCase: CreateEtapaUseCase,
    private readonly updateEtapaUseCase: UpdateEtapaUseCase,
    private readonly listEtapasUseCase: ListEtapasUseCase,
    private readonly buscarEtapasUseCase: BuscarEtapasUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createEtapaSchema.parse(req.body);
      const etapa = await this.createEtapaUseCase.execute(data);
      return res.status(201).json(etapa);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = etapaIdParamSchema.parse(req.params);
      const data = updateEtapaSchema.parse(req.body);
      const etapa = await this.updateEtapaUseCase.execute(id, data);
      return res.status(200).json(etapa);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listEtapasSchema.parse(req.query);
      const result = await this.listEtapasUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  buscar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = buscarEtapasSchema.parse(req.query);
      const result = await this.buscarEtapasUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
