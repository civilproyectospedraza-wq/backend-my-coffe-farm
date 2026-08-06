import { EntregaParcela, Prisma, PrismaClient } from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@shared/errors/AppError";
import {
  CreateEntregaData,
  EntregaRaw,
  EntregaRepository,
  ListEntregasParams,
  UpdateEntregaData,
} from "../../domain/ports/EntregaRepository";

export class PrismaEntregaRepository implements EntregaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateEntregaData): Promise<EntregaRaw> {
    const solicitud = await this.prisma.solicitudEntregaParcela.findUnique({
      where: { id: data.solicitudId },
    });
    if (!solicitud) {
      throw new NotFoundError("Solicitud de entrega no encontrada");
    }

    // La entrega solo se registra sobre una solicitud que el back office ya
    // tomó. Se valida aquí para poder decir en qué estado está; la garantía
    // real contra carreras es el `updateMany` condicionado de más abajo.
    if (solicitud.estado !== "en_gestion") {
      throw new ConflictError(
        `Solo se puede registrar la entrega de una solicitud en gestión ` +
          `(estado actual: ${solicitud.estado})`
      );
    }

    // La parcela sale de la solicitud, así que no puede discrepar. La
    // suscripción es opcional, pero si viene tiene que ser de esa misma parcela.
    if (data.suscripcionId) {
      const suscripcion = await this.prisma.suscripcion.findUniqueOrThrow({
        where: { id: data.suscripcionId },
      });
      if (suscripcion.parcelaId !== solicitud.parcelaId) {
        throw new BadRequestError(
          "La suscripción no pertenece a la parcela de la solicitud"
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Cerrar la solicitud con un updateMany condicionado a `en_gestion` es lo
      // que garantiza una sola entrega por solicitud: si dos peticiones entran a
      // la vez, solo una actualiza una fila y la otra sale con 409.
      const cerrada = await tx.solicitudEntregaParcela.updateMany({
        where: { id: data.solicitudId, estado: "en_gestion" },
        data: { estado: "gestionada" },
      });
      if (cerrada.count === 0) {
        throw new ConflictError(
          "La solicitud ya fue gestionada; no admite otra entrega"
        );
      }

      const created = await tx.entregaParcela.create({
        data: {
          parcelaId: solicitud.parcelaId,
          solicitudId: data.solicitudId,
          suscripcionId: data.suscripcionId ?? null,
          cantidadEntregada: data.cantidadEntregada,
          valorPagado: data.valorPagado,
          imagenComprobantePagoId: data.imagenComprobanteId ?? null,
        },
      });

      return this.toRaw(created);
    });
  }

  async findById(id: string): Promise<EntregaRaw | null> {
    const record = await this.prisma.entregaParcela.findUnique({
      where: { id },
    });

    return record ? this.toRaw(record) : null;
  }

  async update(id: string, data: UpdateEntregaData): Promise<EntregaRaw> {
    const updated = await this.prisma.entregaParcela.update({
      where: { id },
      data: {
        cantidadEntregada: data.cantidadEntregada,
        valorPagado: data.valorPagado,
        // Solo se reasigna cuando llega un nuevo comprobante.
        imagenComprobantePagoId:
          data.imagenComprobanteId !== undefined
            ? data.imagenComprobanteId
            : undefined,
      },
    });

    return this.toRaw(updated);
  }

  async findMany(
    params: ListEntregasParams
  ): Promise<PaginatedResult<EntregaRaw>> {
    const { page, limit, parcelaId, suscripcionId, solicitudId, propietarioId } =
      params;
    const skip = (page - 1) * limit;

    const where: Prisma.EntregaParcelaWhereInput = {};
    if (parcelaId) where.parcelaId = parcelaId;
    if (suscripcionId) where.suscripcionId = suscripcionId;
    if (solicitudId) where.solicitudId = solicitudId;
    // Seguridad: filtra las entregas a través de la cadena
    // parcela → finca → propietario. Si un Propietario manipula el query
    // (p. ej. una `parcelaId` ajena), este AND devuelve vacío.
    if (propietarioId) {
      where.parcela = { finca: { propietarioId } };
    }

    const [records, total] = await this.prisma.$transaction([
      this.prisma.entregaParcela.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.entregaParcela.count({ where }),
    ]);

    const data = records.map((r) => this.toRaw(r));

    return buildPaginatedResult(data, total, params);
  }

  private toRaw(record: EntregaParcela): EntregaRaw {
    return {
      id: record.id,
      parcelaId: record.parcelaId,
      cantidadEntregada: record.cantidadEntregada.toNumber(),
      valorPagado: record.valorPagado.toNumber(),
      imagenComprobanteId: record.imagenComprobantePagoId,
      suscripcionId: record.suscripcionId,
      solicitudId: record.solicitudId,
      createdAt: record.createdAt,
    };
  }
}
