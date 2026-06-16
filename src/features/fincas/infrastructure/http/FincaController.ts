import { NextFunction, Request, Response } from "express";
import { UploadImagePayload } from "../../domain/ports/ImageStorage";
import { BuscarFincasUseCase } from "../../application/use-cases/BuscarFincasUseCase";
import { CreateFincaUseCase } from "../../application/use-cases/CreateFincaUseCase";
import { GetFincaImagenUrlUseCase } from "../../application/use-cases/GetFincaImagenUrlUseCase";
import { ListFincasUseCase } from "../../application/use-cases/ListFincasUseCase";
import { ResumenFincaUseCase } from "../../application/use-cases/ResumenFincaUseCase";
import { UpdateFincaUseCase } from "../../application/use-cases/UpdateFincaUseCase";
import {
  buscarFincasSchema,
  createFincaSchema,
  fincaIdParamSchema,
  listFincasSchema,
  resumenFincaQuerySchema,
  updateFincaSchema,
} from "./validators/fincaSchemas";

/** Convierte el archivo recibido por multer en el payload del use case. */
function toImagenPayload(file?: Express.Multer.File): UploadImagePayload | undefined {
  if (!file) {
    return undefined;
  }
  return { buffer: file.buffer, mimeType: file.mimetype };
}

export class FincaController {
  constructor(
    private readonly createFincaUseCase: CreateFincaUseCase,
    private readonly updateFincaUseCase: UpdateFincaUseCase,
    private readonly listFincasUseCase: ListFincasUseCase,
    private readonly resumenFincaUseCase: ResumenFincaUseCase,
    private readonly buscarFincasUseCase: BuscarFincasUseCase,
    private readonly getFincaImagenUrlUseCase: GetFincaImagenUrlUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createFincaSchema.parse(req.body);
      const finca = await this.createFincaUseCase.execute(
        data,
        toImagenPayload(req.file)
      );
      return res.status(201).json(finca);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = fincaIdParamSchema.parse(req.params);
      const data = updateFincaSchema.parse(req.body);
      const finca = await this.updateFincaUseCase.execute(
        id,
        data,
        toImagenPayload(req.file)
      );
      return res.status(200).json(finca);
    } catch (error) {
      return next(error);
    }
  };

  getImagen = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = fincaIdParamSchema.parse(req.params);
      const url = await this.getFincaImagenUrlUseCase.execute(id);
      return res.status(200).json({ url });
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listFincasSchema.parse(req.query);
      const result = await this.listFincasUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  buscar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = buscarFincasSchema.parse(req.query);
      const result = await this.buscarFincasUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  resumen = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = fincaIdParamSchema.parse(req.params);
      const { fechaInicio, fechaFin } = resumenFincaQuerySchema.parse(req.query);
      const result = await this.resumenFincaUseCase.execute({
        fincaId: id,
        fechaInicio,
        fechaFin,
      });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
