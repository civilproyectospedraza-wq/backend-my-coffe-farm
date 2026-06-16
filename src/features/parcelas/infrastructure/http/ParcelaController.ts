import { NextFunction, Request, Response } from "express";
import { NovedadImagen } from "../../application/dtos/NovedadDtos";
import { CreateParcelaUseCase } from "../../application/use-cases/CreateParcelaUseCase";
import { GetParcelaUseCase } from "../../application/use-cases/GetParcelaUseCase";
import { ListNovedadesParcelaUseCase } from "../../application/use-cases/ListNovedadesParcelaUseCase";
import { ListParcelasUseCase } from "../../application/use-cases/ListParcelasUseCase";
import { RegistrarNovedadParcelaUseCase } from "../../application/use-cases/RegistrarNovedadParcelaUseCase";
import { UpdateParcelaUseCase } from "../../application/use-cases/UpdateParcelaUseCase";
import {
  createParcelaSchema,
  listParcelasSchema,
  parcelaIdParamSchema,
  registrarNovedadSchema,
  updateParcelaSchema,
} from "./validators/parcelaSchemas";

/** Convierte los archivos recibidos por multer en payloads de imagen. */
function toNovedadImagenes(files?: Express.Multer.File[]): NovedadImagen[] {
  if (!files) {
    return [];
  }
  return files.map((file) => ({
    buffer: file.buffer,
    mimeType: file.mimetype,
  }));
}

export class ParcelaController {
  constructor(
    private readonly createParcelaUseCase: CreateParcelaUseCase,
    private readonly updateParcelaUseCase: UpdateParcelaUseCase,
    private readonly listParcelasUseCase: ListParcelasUseCase,
    private readonly getParcelaUseCase: GetParcelaUseCase,
    private readonly registrarNovedadUseCase: RegistrarNovedadParcelaUseCase,
    private readonly listNovedadesUseCase: ListNovedadesParcelaUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createParcelaSchema.parse(req.body);
      const parcela = await this.createParcelaUseCase.execute(data);
      return res.status(201).json(parcela);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = parcelaIdParamSchema.parse(req.params);
      const data = updateParcelaSchema.parse(req.body);
      const parcela = await this.updateParcelaUseCase.execute(id, data);
      return res.status(200).json(parcela);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listParcelasSchema.parse(req.query);
      const result = await this.listParcelasUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = parcelaIdParamSchema.parse(req.params);
      const parcela = await this.getParcelaUseCase.execute(id);
      return res.status(200).json(parcela);
    } catch (error) {
      return next(error);
    }
  };

  registrarNovedad = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = parcelaIdParamSchema.parse(req.params);
      const data = registrarNovedadSchema.parse(req.body);
      const imagenes = toNovedadImagenes(req.files as Express.Multer.File[]);
      const novedad = await this.registrarNovedadUseCase.execute(
        id,
        data,
        imagenes
      );
      return res.status(201).json(novedad);
    } catch (error) {
      return next(error);
    }
  };

  listNovedades = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = parcelaIdParamSchema.parse(req.params);
      const novedades = await this.listNovedadesUseCase.execute(id);
      return res.status(200).json(novedades);
    } catch (error) {
      return next(error);
    }
  };
}
