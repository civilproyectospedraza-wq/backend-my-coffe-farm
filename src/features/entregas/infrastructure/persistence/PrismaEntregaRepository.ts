import { EntregaParcelaSuscripcion, Prisma, PrismaClient } from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
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
    // Garantiza que la suscripción exista antes de registrar la entrega.
    await this.prisma.suscripcion.findUniqueOrThrow({
      where: { id: data.suscripcionId },
    });

    const created = await this.prisma.entregaParcelaSuscripcion.create({
      data: {
        suscripcionId: data.suscripcionId,
        cantidadEntregada: data.cantidadEntregada,
        valorPagado: data.valorPagado,
        imagenComprobantePagoId: data.imagenComprobanteId ?? null,
      },
    });

    return this.toRaw(created);
  }

  async findById(id: string): Promise<EntregaRaw | null> {
    const record = await this.prisma.entregaParcelaSuscripcion.findUnique({
      where: { id },
    });

    return record ? this.toRaw(record) : null;
  }

  async update(id: string, data: UpdateEntregaData): Promise<EntregaRaw> {
    const updated = await this.prisma.entregaParcelaSuscripcion.update({
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
    const { page, limit, suscripcionId, propietarioId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.EntregaParcelaSuscripcionWhereInput = {};
    if (suscripcionId) where.suscripcionId = suscripcionId;
    // Seguridad: filtra las entregas a través de la cadena
    // suscripción → parcela → finca → propietario. Si un Propietario manipula el
    // query (p. ej. una `suscripcionId` ajena), este AND devuelve vacío.
    if (propietarioId) {
      where.suscripcion = { parcela: { finca: { propietarioId } } };
    }

    const [records, total] = await this.prisma.$transaction([
      this.prisma.entregaParcelaSuscripcion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.entregaParcelaSuscripcion.count({ where }),
    ]);

    const data = records.map((r) => this.toRaw(r));

    return buildPaginatedResult(data, total, params);
  }

  private toRaw(record: EntregaParcelaSuscripcion): EntregaRaw {
    return {
      id: record.id,
      cantidadEntregada: record.cantidadEntregada.toNumber(),
      valorPagado: record.valorPagado.toNumber(),
      imagenComprobanteId: record.imagenComprobantePagoId,
      suscripcionId: record.suscripcionId,
      createdAt: record.createdAt,
    };
  }
}
