import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "@shared/errors/AppError";
import { CompletarVentaUseCase } from "../../application/use-cases/CompletarVentaUseCase";
import { CreateVentaUseCase } from "../../application/use-cases/CreateVentaUseCase";
import { PaginateVentasUseCase } from "../../application/use-cases/PaginateVentasUseCase";
import { PaymentGateway } from "../../domain/ports/PaymentGateway";
import {
  createVentaSchema,
  listVentasSchema,
  ventaIdParamSchema,
} from "./validators/ventaSchemas";

export class VentaController {
  constructor(
    private readonly createVentaUseCase: CreateVentaUseCase,
    private readonly completarVentaUseCase: CompletarVentaUseCase,
    private readonly paginateVentasUseCase: PaginateVentasUseCase,
    private readonly paymentGateway: PaymentGateway
  ) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listVentasSchema.parse(req.query);
      const result = await this.paginateVentasUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createVentaSchema.parse(req.body);
      const result = await this.createVentaUseCase.execute({
        parcelaId: data.parcelaId,
        valor: data.valor,
        comprador: {
          nombre: data.comprador.nombre,
          email: data.comprador.email,
          telefono: data.comprador.telefono ?? null,
          direccion: data.comprador.direccion ?? null,
          tipoIdentificacion: data.comprador.tipoIdentificacion ?? null,
          identificacion: data.comprador.identificacion ?? null,
        },
        // El comprador es anónimo; si un usuario autenticado registra la venta
        // (admin), authMiddleware habrá poblado req.user.
        createdBy: req.user?.id ?? null,
      });
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  };

  // Completación manual (admin/offline) sin pasar por Stripe.
  completar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = ventaIdParamSchema.parse(req.params);
      const venta = await this.completarVentaUseCase.completarManual(id);
      return res.status(200).json(venta);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Webhook de Stripe. Recibe el body crudo (Buffer) y la firma; verifica,
   * y si el pago fue aprobado completa la venta. Responde 200 para confirmar
   * la recepción a Stripe.
   */
  webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers["stripe-signature"];
      if (typeof signature !== "string") {
        throw new BadRequestError("Falta la firma del webhook de Stripe");
      }

      const evento = this.paymentGateway.parseApprovedPayment(
        req.body as Buffer,
        signature
      );

      // Evento no relevante (otro tipo o pago no aprobado): se confirma y listo.
      if (evento) {
        await this.completarVentaUseCase.completarDesdePago(evento);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      return next(error);
    }
  };
}
