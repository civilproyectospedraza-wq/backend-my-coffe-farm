import {
  Prisma,
  PrismaClient,
  SolicitudEntregaParcela as PrismaSolicitudEntregaParcela,
} from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import { EstadoSolicitudEntrega } from "../../domain/entities/EstadoSolicitudEntrega";
import { SolicitudEntregaParcela } from "../../domain/entities/SolicitudEntregaParcela";
import {
  CountSolicitudesEntregasParcelasParams,
  CreateSolicitudEntregaParcelaData,
  ListSolicitudesEntregasParcelasParams,
  ParcelaSolicitudContexto,
  SolicitudEntregaParcelaListItem,
  SolicitudEntregaParcelaRepository,
  SolicitudesEntregasParcelasConteoPorEstado,
} from "../../domain/ports/SolicitudEntregaParcelaRepository";

export class PrismaSolicitudEntregaParcelaRepository
  implements SolicitudEntregaParcelaRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    data: CreateSolicitudEntregaParcelaData
  ): Promise<SolicitudEntregaParcela> {
    const created = await this.prisma.solicitudEntregaParcela.create({
      data: {
        parcelaId: data.parcelaId,
        cantidadKg: data.cantidadKg,
        tarifaVersionId: data.tarifaVersionId,
        valor: data.valor,
        // `estado` lo pone la BD en `pendiente` por defecto.
      },
    });

    return this.toDomain(created);
  }

  async findParcelaContexto(
    parcelaId: string
  ): Promise<ParcelaSolicitudContexto | null> {
    const parcela = await this.prisma.parcela.findUnique({
      where: { id: parcelaId },
      select: {
        id: true,
        versionActual: {
          select: {
            nombre: true,
            // La tarifa vigente cuelga de la versión actual de la parcela.
            tarifaMetraje: { select: { versionActual: true } },
          },
        },
        finca: {
          select: {
            nombre: true,
            propietario: {
              select: { id: true, persona: { select: { nombre: true } } },
            },
          },
        },
      },
    });

    if (!parcela) {
      return null;
    }

    const tarifaVersion =
      parcela.versionActual?.tarifaMetraje?.versionActual ?? null;

    return {
      parcelaId: parcela.id,
      parcelaNombre: parcela.versionActual?.nombre ?? null,
      fincaNombre: parcela.finca.nombre,
      propietarioId: parcela.finca.propietario.id,
      propietarioNombre: parcela.finca.propietario.persona.nombre,
      tarifaVersionId: tarifaVersion?.id ?? null,
      valorPropietarioPorKg:
        tarifaVersion?.valorProduccionPropietarioPorKg.toNumber() ?? null,
    };
  }

  async findMany(
    params: ListSolicitudesEntregasParcelasParams
  ): Promise<PaginatedResult<SolicitudEntregaParcelaListItem>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const where = this.buildWhere(params);

    const [records, total] = await this.prisma.$transaction([
      this.prisma.solicitudEntregaParcela.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          parcela: {
            select: {
              versionActual: { select: { nombre: true } },
              finca: { select: { nombre: true } },
            },
          },
        },
      }),
      this.prisma.solicitudEntregaParcela.count({ where }),
    ]);

    const data = records.map((record) => ({
      solicitud: this.toDomain(record),
      parcelaNombre: record.parcela.versionActual?.nombre ?? null,
      fincaNombre: record.parcela.finca.nombre,
    }));

    return buildPaginatedResult(data, total, params);
  }

  async countByEstado(
    params: CountSolicitudesEntregasParcelasParams
  ): Promise<SolicitudesEntregasParcelasConteoPorEstado> {
    const where = this.buildWhere(params);

    // Un solo groupBy en vez de dos counts: la BD devuelve el conteo de cada
    // estado presente (un estado sin filas simplemente no aparece → 0).
    const grupos = await this.prisma.solicitudEntregaParcela.groupBy({
      by: ["estado"],
      where,
      _count: { _all: true },
    });

    const contar = (estado: EstadoSolicitudEntrega) =>
      grupos.find((grupo) => grupo.estado === estado)?._count._all ?? 0;

    return {
      pendientes: contar(EstadoSolicitudEntrega.pendiente),
      enGestion: contar(EstadoSolicitudEntrega.en_gestion),
      gestionadas: contar(EstadoSolicitudEntrega.gestionada),
      canceladas: contar(EstadoSolicitudEntrega.cancelado),
    };
  }

  async updateEstado(
    id: string,
    estado: EstadoSolicitudEntrega
  ): Promise<SolicitudEntregaParcela | null> {
    const existente = await this.prisma.solicitudEntregaParcela.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existente) {
      return null;
    }

    const actualizada = await this.prisma.solicitudEntregaParcela.update({
      where: { id },
      data: { estado },
    });

    return this.toDomain(actualizada);
  }

  /**
   * Filtros comunes al listado y al resumen. Seguridad: el scope de propietario
   * filtra por la cadena parcela → finca → propietario, así que si un
   * Propietario manipula el query (p. ej. una `parcelaId` ajena) el resultado
   * queda vacío.
   */
  private buildWhere(params: {
    parcelaId?: string;
    estado?: EstadoSolicitudEntrega;
    propietarioId?: string;
  }): Prisma.SolicitudEntregaParcelaWhereInput {
    const { parcelaId, estado, propietarioId } = params;

    const where: Prisma.SolicitudEntregaParcelaWhereInput = {};
    if (parcelaId) where.parcelaId = parcelaId;
    if (estado) where.estado = estado;
    if (propietarioId) {
      where.parcela = { finca: { propietarioId } };
    }

    return where;
  }

  private toDomain(
    record: PrismaSolicitudEntregaParcela
  ): SolicitudEntregaParcela {
    return new SolicitudEntregaParcela({
      id: record.id,
      parcelaId: record.parcelaId,
      cantidadKg: record.cantidadKg.toNumber(),
      tarifaVersionId: record.tarifaVersionId,
      valor: record.valor?.toNumber() ?? null,
      estado: record.estado as EstadoSolicitudEntrega,
      createdAt: record.createdAt,
    });
  }
}
