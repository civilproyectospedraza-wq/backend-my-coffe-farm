import { NextFunction, Request, Response } from "express";
import { resolvePropietarioScope } from "@shared/infrastructure/http/propietarioScope";
import { ComprobanteImagen } from "../../application/dtos/EntregaDtos";
import { CreateEntregaUseCase } from "../../application/use-cases/CreateEntregaUseCase";
import { PaginateEntregasUseCase } from "../../application/use-cases/PaginateEntregasUseCase";
import { UpdateEntregaUseCase } from "../../application/use-cases/UpdateEntregaUseCase";
import {
  createEntregaSchema,
  entregaIdParamSchema,
  listEntregasSchema,
  updateEntregaSchema,
} from "./validators/entregaSchemas";

/** Convierte el archivo recibido por multer en el payload del comprobante. */
function toComprobantePayload(
  file?: Express.Multer.File
): ComprobanteImagen | undefined {
  if (!file) {
    return undefined;
  }
  return { buffer: file.buffer, mimeType: file.mimetype };
}

export class EntregaController {
  constructor(
    private readonly createEntregaUseCase: CreateEntregaUseCase,
    private readonly updateEntregaUseCase: UpdateEntregaUseCase,
    private readonly paginateEntregasUseCase: PaginateEntregasUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createEntregaSchema.parse(req.body);
      const entrega = await this.createEntregaUseCase.execute(
        data,
        toComprobantePayload(req.file)
      );
      return res.status(201).json(entrega);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = entregaIdParamSchema.parse(req.params);
      const data = updateEntregaSchema.parse(req.body);
      const entrega = await this.updateEntregaUseCase.execute(
        id,
        data,
        toComprobantePayload(req.file)
      );
      return res.status(200).json(entrega);
    } catch (error) {
      return next(error);
    }
  };

  paginate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listEntregasSchema.parse(req.query);
      // Seguridad: un Propietario solo ve sus entregas (scope forzado desde el
      // JWT, aunque no venga `suscripcionId`). Para un Admin queda undefined.
      const propietarioId = resolvePropietarioScope(req);
      const result = await this.paginateEntregasUseCase.execute({
        ...params,
        propietarioId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
