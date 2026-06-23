import { Prisma, PrismaClient } from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import {
  CreateNovedadData,
  ListNovedadesParams,
  NovedadListItemRaw,
  NovedadRaw,
  NovedadRepository,
} from "../../domain/ports/NovedadRepository";

// Relaciones que componen una novedad (etapa + imágenes).
const novedadInclude = {
  etapa: { select: { id: true, nombre: true, orden: true } },
  detalles: {
    orderBy: { createdAt: "asc" },
    select: { imagenLocalId: true, imagenAwsId: true },
  },
} satisfies Prisma.NovedadParcelaInclude;

type NovedadWithRelations = Prisma.NovedadParcelaGetPayload<{
  include: typeof novedadInclude;
}>;

// Novedad + parcela de origen (su nombre vive en la versión actual), para el
// listado paginado.
const novedadListInclude = {
  ...novedadInclude,
  parcela: {
    select: { id: true, versionActual: { select: { nombre: true } } },
  },
} satisfies Prisma.NovedadParcelaInclude;

export class PrismaNovedadRepository implements NovedadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateNovedadData): Promise<NovedadRaw> {
    const novedad = await this.prisma.$transaction(async (tx) => {
      // Garantiza que la parcela exista antes de crear la novedad.
      await tx.parcela.findUniqueOrThrow({ where: { id: data.parcelaId } });

      const created = await tx.novedadParcela.create({
        data: {
          parcelaId: data.parcelaId,
          etapaId: data.etapaId ?? null,
          descripcion: data.descripcion ?? null,
          detalles: data.imagenIds.length
            ? {
                create: data.imagenIds.map((imagenLocalId) => ({
                  imagenLocalId,
                })),
              }
            : undefined,
        },
        include: novedadInclude,
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

    return this.toNovedadRaw(novedad);
  }

  async findByParcela(parcelaId: string): Promise<NovedadRaw[]> {
    const records = await this.prisma.novedadParcela.findMany({
      where: { parcelaId },
      orderBy: { createdAt: "desc" },
      include: novedadInclude,
    });

    return records.map((r) => this.toNovedadRaw(r));
  }

  async findMany(
    params: ListNovedadesParams
  ): Promise<PaginatedResult<NovedadListItemRaw>> {
    const { page, limit, parcelaId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.NovedadParcelaWhereInput = {};
    if (parcelaId) where.parcelaId = parcelaId;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.novedadParcela.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: novedadListInclude,
      }),
      this.prisma.novedadParcela.count({ where }),
    ]);

    const data: NovedadListItemRaw[] = records.map((r) => ({
      ...this.toNovedadRaw(r),
      parcela: {
        id: r.parcela.id,
        nombre: r.parcela.versionActual?.nombre ?? "",
      },
    }));

    return buildPaginatedResult(data, total, params);
  }

  private toNovedadRaw(record: NovedadWithRelations): NovedadRaw {
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
      imagenes: record.detalles.flatMap((det) => {
        const imagenId = det.imagenLocalId ?? det.imagenAwsId;
        return imagenId ? [{ imagenId }] : [];
      }),
    };
  }
}
