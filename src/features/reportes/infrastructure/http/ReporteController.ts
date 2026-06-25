import { NextFunction, Request, Response } from "express";
import { ReporteImagen } from "../../application/dtos/ReporteDtos";
import { CreateReporteUseCase } from "../../application/use-cases/CreateReporteUseCase";
import { PaginateReportesUseCase } from "../../application/use-cases/PaginateReportesUseCase";
import {
  createReporteSchema,
  listReportesSchema,
} from "./validators/reporteSchemas";

/** Convierte los archivos recibidos por multer en payloads de imagen. */
export function toReporteImagenes(
  files?: Express.Multer.File[]
): ReporteImagen[] {
  if (!files) {
    return [];
  }
  return files.map((file) => ({
    buffer: file.buffer,
    mimeType: file.mimetype,
  }));
}

export class ReporteController {
  constructor(
    private readonly createReporteUseCase: CreateReporteUseCase,
    private readonly paginateReportesUseCase: PaginateReportesUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { parcelaId, ...data } = createReporteSchema.parse(req.body);
      const imagenes = toReporteImagenes(req.files as Express.Multer.File[]);
      const reporte = await this.createReporteUseCase.execute(
        parcelaId,
        data,
        imagenes
      );
      return res.status(201).json(reporte);
    } catch (error) {
      return next(error);
    }
  };

  paginate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listReportesSchema.parse(req.query);
      const result = await this.paginateReportesUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
