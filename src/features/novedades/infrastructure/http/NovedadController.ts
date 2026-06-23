import { NextFunction, Request, Response } from "express";
import { NovedadImagen } from "../../application/dtos/NovedadDtos";
import { CreateNovedadUseCase } from "../../application/use-cases/CreateNovedadUseCase";
import { PaginateNovedadesUseCase } from "../../application/use-cases/PaginateNovedadesUseCase";
import {
  createNovedadSchema,
  listNovedadesSchema,
} from "./validators/novedadSchemas";

/** Convierte los archivos recibidos por multer en payloads de imagen. */
export function toNovedadImagenes(
  files?: Express.Multer.File[]
): NovedadImagen[] {
  if (!files) {
    return [];
  }
  return files.map((file) => ({
    buffer: file.buffer,
    mimeType: file.mimetype,
  }));
}

export class NovedadController {
  constructor(
    private readonly createNovedadUseCase: CreateNovedadUseCase,
    private readonly paginateNovedadesUseCase: PaginateNovedadesUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { parcelaId, ...data } = createNovedadSchema.parse(req.body);
      const imagenes = toNovedadImagenes(req.files as Express.Multer.File[]);
      const novedad = await this.createNovedadUseCase.execute(
        parcelaId,
        data,
        imagenes
      );
      return res.status(201).json(novedad);
    } catch (error) {
      return next(error);
    }
  };

  paginate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listNovedadesSchema.parse(req.query);
      const result = await this.paginateNovedadesUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
