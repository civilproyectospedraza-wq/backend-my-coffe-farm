import { Prisma, PrismaClient } from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import {
  CreateReporteData,
  ListReportesParams,
  ReporteListItemRaw,
  ReporteRaw,
  ReporteRepository,
} from "../../domain/ports/ReporteRepository";

// Relaciones que componen un reporte (etapa + imágenes).
const reporteInclude = {
  etapa: { select: { id: true, nombre: true, orden: true } },
  imagenes: {
    orderBy: { createdAt: "asc" },
    select: { imagenLocalId: true },
  },
} satisfies Prisma.ReporteInclude;

type ReporteWithRelations = Prisma.ReporteGetPayload<{
  include: typeof reporteInclude;
}>;

// Reporte + parcela de origen (su nombre vive en la versión actual), para el
// listado paginado.
const reporteListInclude = {
  ...reporteInclude,
  parcela: {
    select: { id: true, versionActual: { select: { nombre: true } } },
  },
} satisfies Prisma.ReporteInclude;

export class PrismaReporteRepository implements ReporteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateReporteData): Promise<ReporteRaw> {
    const reporte = await this.prisma.$transaction(async (tx) => {
      // Garantiza que la parcela exista antes de crear el reporte.
      await tx.parcela.findUniqueOrThrow({ where: { id: data.parcelaId } });

      const created = await tx.reporte.create({
        data: {
          parcelaId: data.parcelaId,
          etapaId: data.etapaId ?? null,
          descripcion: data.descripcion ?? null,
          imagenes: data.imagenIds.length
            ? {
                create: data.imagenIds.map((imagenLocalId) => ({
                  imagenLocalId,
                })),
              }
            : undefined,
        },
        include: reporteInclude,
      });

      // El cambio de etapa es opcional; si viene, avanza la etapa actual.
      if (data.etapaId) {
        await tx.parcela.update({
          where: { id: data.parcelaId },
          data: { etapaActualId: data.etapaId },
        });
      }

      return created;
    });

    return this.toReporteRaw(reporte);
  }

  async findByParcela(parcelaId: string): Promise<ReporteRaw[]> {
    const records = await this.prisma.reporte.findMany({
      where: { parcelaId },
      orderBy: { createdAt: "desc" },
      include: reporteInclude,
    });

    return records.map((r) => this.toReporteRaw(r));
  }

  async findMany(
    params: ListReportesParams
  ): Promise<PaginatedResult<ReporteListItemRaw>> {
    const { page, limit, parcelaId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ReporteWhereInput = {};
    if (parcelaId) where.parcelaId = parcelaId;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.reporte.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: reporteListInclude,
      }),
      this.prisma.reporte.count({ where }),
    ]);

    const data: ReporteListItemRaw[] = records.map((r) => ({
      ...this.toReporteRaw(r),
      parcela: {
        id: r.parcela.id,
        nombre: r.parcela.versionActual?.nombre ?? "",
      },
    }));

    return buildPaginatedResult(data, total, params);
  }

  private toReporteRaw(record: ReporteWithRelations): ReporteRaw {
    return {
      id: record.id,
      descripcion: record.descripcion,
      fecha: record.createdAt,
      etapa: record.etapa
        ? {
            id: record.etapa.id,
            nombre: record.etapa.nombre,
            orden: record.etapa.orden,
          }
        : null,
      imagenes: record.imagenes.map((im) => ({ imagenId: im.imagenLocalId })),
    };
  }
}
