import { NextFunction, Request, Response } from "express";
import { GetCatalogParcelaDetailUseCase } from "../../application/use-cases/GetCatalogParcelaDetailUseCase";
import { ListCatalogParcelasUseCase } from "../../application/use-cases/ListCatalogParcelasUseCase";
import {
  listCatalogParcelasSchema,
  parcelaIdParamSchema,
} from "./validators/parcelaSchemas";

/** Endpoints públicos (sin auth) del catálogo de parcelas para la venta. */
export class PublicParcelaController {
  constructor(
    private readonly listCatalogParcelasUseCase: ListCatalogParcelasUseCase,
    private readonly getCatalogParcelaDetailUseCase: GetCatalogParcelaDetailUseCase
  ) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listCatalogParcelasSchema.parse(req.query);
      const result = await this.listCatalogParcelasUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = parcelaIdParamSchema.parse(req.params);
      const result = await this.getCatalogParcelaDetailUseCase.execute(id);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
