import {
  Prisma,
  PrismaClient,
  TarifaMetrajeParcelaVersion as PrismaTarifaVersion,
} from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import {
  TarifaMetraje,
  TarifaMetrajeVersion,
} from "../../domain/entities/TarifaMetraje";
import {
  CreateTarifaMetrajeData,
  CreateTarifaMetrajeVersionData,
  ListTarifasMetrajeParams,
  TarifaMetrajeRepository,
} from "../../domain/ports/TarifaMetrajeRepository";

// Tarifa con su versión actual incluida para poder exponer el valor vigente.
type TarifaConVersion = Prisma.TarifaMetrajeParcelaGetPayload<{
  include: { versionActual: true };
}>;

export class PrismaTarifaMetrajeRepository implements TarifaMetrajeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateTarifaMetrajeData): Promise<TarifaMetraje> {
    // Crea la tarifa, su primera versión y deja el puntero apuntando a ella.
    const created = await this.prisma.$transaction(async (tx) => {
      const tarifa = await tx.tarifaMetrajeParcela.create({
        data: {
          medidaMetrosCuadrados: data.medidaMetrosCuadrados,
          createdBy: data.createdBy ?? null,
        },
      });

      const version = await tx.tarifaMetrajeParcelaVersion.create({
        data: {
          tarifaMedidaId: tarifa.id,
          valorVenta: data.valorVenta,
          valorPropietario: data.valorPropietario,
          produccionKg: data.produccionKg,
          cantidadMinimaEntrega: data.cantidadMinimaEntrega,
          createdBy: data.createdBy ?? null,
        },
      });

      return tx.tarifaMetrajeParcela.update({
        where: { id: tarifa.id },
        data: { versionId: version.id },
        include: { versionActual: true },
      });
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<TarifaMetraje | null> {
    const found = await this.prisma.tarifaMetrajeParcela.findUnique({
      where: { id },
      include: { versionActual: true },
    });
    return found ? this.toDomain(found) : null;
  }

  async findMany(
    params: ListTarifasMetrajeParams
  ): Promise<PaginatedResult<TarifaMetraje>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.tarifaMetrajeParcela.findMany({
        skip,
        take: limit,
        orderBy: { medidaMetrosCuadrados: "asc" },
        include: { versionActual: true },
      }),
      this.prisma.tarifaMetrajeParcela.count(),
    ]);

    return buildPaginatedResult(
      records.map((r) => this.toDomain(r)),
      total,
      params
    );
  }

  async findAll(): Promise<TarifaMetraje[]> {
    const records = await this.prisma.tarifaMetrajeParcela.findMany({
      orderBy: { medidaMetrosCuadrados: "asc" },
      include: { versionActual: true },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findVersions(tarifaId: string): Promise<TarifaMetrajeVersion[]> {
    const versions = await this.prisma.tarifaMetrajeParcelaVersion.findMany({
      where: { tarifaMedidaId: tarifaId },
      orderBy: { createdAt: "desc" },
    });
    return versions.map((v) => this.toVersionDomain(v));
  }

  async createVersion(
    tarifaId: string,
    data: CreateTarifaMetrajeVersionData
  ): Promise<TarifaMetrajeVersion> {
    // Crea la versión nueva y reasigna el puntero de la tarifa a ella.
    const version = await this.prisma.$transaction(async (tx) => {
      const nueva = await tx.tarifaMetrajeParcelaVersion.create({
        data: {
          tarifaMedidaId: tarifaId,
          valorVenta: data.valorVenta,
          valorPropietario: data.valorPropietario,
          produccionKg: data.produccionKg,
          cantidadMinimaEntrega: data.cantidadMinimaEntrega,
          createdBy: data.createdBy ?? null,
        },
      });

      await tx.tarifaMetrajeParcela.update({
        where: { id: tarifaId },
        data: { versionId: nueva.id },
      });

      return nueva;
    });

    return this.toVersionDomain(version);
  }

  private toDomain(record: TarifaConVersion): TarifaMetraje {
    return new TarifaMetraje({
      id: record.id,
      medidaMetrosCuadrados: record.medidaMetrosCuadrados.toNumber(),
      versionId: record.versionId,
      valorVentaActual: record.versionActual?.valorVenta.toNumber() ?? null,
      valorPropietarioActual:
        record.versionActual?.valorPropietario.toNumber() ?? null,
      produccionKgActual: record.versionActual?.produccionKg.toNumber() ?? null,
      cantidadMinimaEntregaActual:
        record.versionActual?.cantidadMinimaEntrega.toNumber() ?? null,
      createdAt: record.createdAt,
      createdBy: record.createdBy,
    });
  }

  private toVersionDomain(
    record: PrismaTarifaVersion
  ): TarifaMetrajeVersion {
    return new TarifaMetrajeVersion({
      id: record.id,
      tarifaMedidaId: record.tarifaMedidaId,
      valorVenta: record.valorVenta.toNumber(),
      valorPropietario: record.valorPropietario.toNumber(),
      produccionKg: record.produccionKg.toNumber(),
      cantidadMinimaEntrega: record.cantidadMinimaEntrega.toNumber(),
      createdAt: record.createdAt,
      createdBy: record.createdBy,
    });
  }
}
