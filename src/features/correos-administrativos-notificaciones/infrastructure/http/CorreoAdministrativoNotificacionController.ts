import { NextFunction, Request, Response } from "express";
import { CreateCorreoAdministrativoNotificacionUseCase } from "../../application/use-cases/CreateCorreoAdministrativoNotificacionUseCase";
import { PaginateCorreosAdministrativosNotificacionesUseCase } from "../../application/use-cases/PaginateCorreosAdministrativosNotificacionesUseCase";
import { UpdateCorreoAdministrativoNotificacionUseCase } from "../../application/use-cases/UpdateCorreoAdministrativoNotificacionUseCase";
import {
  correoAdministrativoNotificacionIdParamSchema,
  createCorreoAdministrativoNotificacionSchema,
  listCorreosAdministrativosNotificacionesSchema,
  updateCorreoAdministrativoNotificacionSchema,
} from "./validators/correoAdministrativoNotificacionSchemas";

export class CorreoAdministrativoNotificacionController {
  constructor(
    private readonly createCorreoAdministrativoNotificacionUseCase: CreateCorreoAdministrativoNotificacionUseCase,
    private readonly updateCorreoAdministrativoNotificacionUseCase: UpdateCorreoAdministrativoNotificacionUseCase,
    private readonly paginateCorreosAdministrativosNotificacionesUseCase: PaginateCorreosAdministrativosNotificacionesUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createCorreoAdministrativoNotificacionSchema.parse(req.body);
      const correo =
        await this.createCorreoAdministrativoNotificacionUseCase.execute(data);
      return res.status(201).json(correo);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = correoAdministrativoNotificacionIdParamSchema.parse(
        req.params
      );
      const data = updateCorreoAdministrativoNotificacionSchema.parse(req.body);
      const correo =
        await this.updateCorreoAdministrativoNotificacionUseCase.execute(
          id,
          data
        );
      return res.status(200).json(correo);
    } catch (error) {
      return next(error);
    }
  };

  paginate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listCorreosAdministrativosNotificacionesSchema.parse(
        req.query
      );
      const result =
        await this.paginateCorreosAdministrativosNotificacionesUseCase.execute(
          params
        );
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
