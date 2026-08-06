import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "@shared/errors/AppError";
import { resolvePropietarioScope } from "@shared/infrastructure/http/propietarioScope";
import { CreateSolicitudEntregaParcelaUseCase } from "../../application/use-cases/CreateSolicitudEntregaParcelaUseCase";
import { GetResumenSolicitudesEntregasParcelasUseCase } from "../../application/use-cases/GetResumenSolicitudesEntregasParcelasUseCase";
import { PaginateSolicitudesEntregasParcelasUseCase } from "../../application/use-cases/PaginateSolicitudesEntregasParcelasUseCase";
import { UpdateEstadoSolicitudEntregaParcelaUseCase } from "../../application/use-cases/UpdateEstadoSolicitudEntregaParcelaUseCase";
import {
  createSolicitudEntregaParcelaSchema,
  listSolicitudesEntregasParcelasSchema,
  listSolicitudesPorParcelaSchema,
  parcelaIdParamSchema,
  resumenSolicitudesEntregasParcelasSchema,
  solicitudEntregaParcelaIdParamSchema,
  updateEstadoSolicitudEntregaParcelaSchema,
} from "./validators/solicitudEntregaParcelaSchemas";

export class SolicitudEntregaParcelaController {
  constructor(
    private readonly createSolicitudEntregaParcelaUseCase: CreateSolicitudEntregaParcelaUseCase,
    private readonly paginateSolicitudesEntregasParcelasUseCase: PaginateSolicitudesEntregasParcelasUseCase,
    private readonly getResumenSolicitudesEntregasParcelasUseCase: GetResumenSolicitudesEntregasParcelasUseCase,
    private readonly updateEstadoSolicitudEntregaParcelaUseCase: UpdateEstadoSolicitudEntregaParcelaUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createSolicitudEntregaParcelaSchema.parse(req.body);

      // La solicitud siempre queda a nombre del propietario del JWT; el rol ya
      // lo restringe la ruta, esto solo protege de un token sin el claim.
      const propietarioId = resolvePropietarioScope(req);
      if (!propietarioId) {
        throw new ForbiddenError(
          "Solo un propietario puede crear solicitudes de entrega"
        );
      }

      const solicitud = await this.createSolicitudEntregaParcelaUseCase.execute({
        ...data,
        propietarioId,
      });
      return res.status(201).json(solicitud);
    } catch (error) {
      return next(error);
    }
  };

  paginate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listSolicitudesEntregasParcelasSchema.parse(req.query);
      // Seguridad: un Propietario solo ve sus solicitudes (scope forzado desde
      // el JWT, aunque no venga `parcelaId`). Para un Admin queda undefined.
      const propietarioId = resolvePropietarioScope(req);
      const result =
        await this.paginateSolicitudesEntregasParcelasUseCase.execute({
          ...params,
          propietarioId,
        });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  // Historial de solicitudes de una parcela concreta (misma respuesta paginada
  // que el listado general, con la parcela fijada desde la ruta).
  paginateByParcela = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { parcelaId } = parcelaIdParamSchema.parse(req.params);
      const params = listSolicitudesPorParcelaSchema.parse(req.query);
      // Mismo scope que el listado general: si un Propietario pide una parcela
      // ajena, el filtro por propietario deja el resultado vacío.
      const propietarioId = resolvePropietarioScope(req);
      const result =
        await this.paginateSolicitudesEntregasParcelasUseCase.execute({
          ...params,
          parcelaId,
          propietarioId,
        });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  // Cambio del estado de gestión. Solo Administrador (lo restringe la ruta),
  // por eso no aplica scope de propietario.
  updateEstado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = solicitudEntregaParcelaIdParamSchema.parse(req.params);
      const { estado } = updateEstadoSolicitudEntregaParcelaSchema.parse(
        req.body
      );

      const solicitud =
        await this.updateEstadoSolicitudEntregaParcelaUseCase.execute({
          id,
          estado,
        });
      return res.status(200).json(solicitud);
    } catch (error) {
      return next(error);
    }
  };

  resumen = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = resumenSolicitudesEntregasParcelasSchema.parse(req.query);
      // Un Administrador puede pedir el resumen de un propietario concreto con
      // `?propietarioId=...`; a un Propietario se le fuerza el suyo (el query
      // param se ignora), así no cuenta solicitudes ajenas.
      const propietarioId = resolvePropietarioScope(req, params.propietarioId);
      const result =
        await this.getResumenSolicitudesEntregasParcelasUseCase.execute({
          parcelaId: params.parcelaId,
          propietarioId,
        });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
