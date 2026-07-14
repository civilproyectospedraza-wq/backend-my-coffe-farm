import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@shared/errors/AppError";
import { AprobarRegistroCaficultorUseCase } from "../../application/use-cases/AprobarRegistroCaficultorUseCase";
import { CreateRegistroCaficultorUseCase } from "../../application/use-cases/CreateRegistroCaficultorUseCase";
import { ListRegistrosCaficultorUseCase } from "../../application/use-cases/ListRegistrosCaficultorUseCase";
import { RechazarRegistroCaficultorUseCase } from "../../application/use-cases/RechazarRegistroCaficultorUseCase";
import {
  createRegistroCaficultorSchema,
  listRegistrosCaficultorSchema,
  rechazarRegistroCaficultorSchema,
} from "./validators/registroCaficultorSchemas";

export class RegistroCaficultorController {
  constructor(
    private readonly createUseCase: CreateRegistroCaficultorUseCase,
    private readonly listUseCase: ListRegistrosCaficultorUseCase,
    private readonly aprobarUseCase: AprobarRegistroCaficultorUseCase,
    private readonly rechazarUseCase: RechazarRegistroCaficultorUseCase
  ) {}

  // Público: el caficultor se registra desde la landing.
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createRegistroCaficultorSchema.parse(req.body);
      const registro = await this.createUseCase.execute(data);
      return res.status(201).json(registro);
    } catch (error) {
      return next(error);
    }
  };

  // Admin: lista las solicitudes (filtrable por estado).
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listRegistrosCaficultorSchema.parse(req.query);
      const result = await this.listUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  // Admin: aprueba la solicitud -> crea propietario/usuario/persona.
  aprobar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const registro = await this.aprobarUseCase.execute({
        id: req.params.id,
        revisadoPor: req.user.id,
      });
      return res.status(200).json(registro);
    } catch (error) {
      return next(error);
    }
  };

  // Admin: rechaza la solicitud con un motivo.
  rechazar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { motivo } = rechazarRegistroCaficultorSchema.parse(req.body);
      const registro = await this.rechazarUseCase.execute({
        id: req.params.id,
        motivo,
        revisadoPor: req.user.id,
      });
      return res.status(200).json(registro);
    } catch (error) {
      return next(error);
    }
  };
}
