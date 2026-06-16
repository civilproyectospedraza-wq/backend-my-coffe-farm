import { Prisma, PrismaClient } from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import {
  CatalogParcelaDetailRaw,
  CatalogParcelaRaw,
  ListCatalogParcelasInput,
} from "../../application/dtos/CatalogDtos";
import { EstadoParcela } from "../../domain/entities/EstadoParcela";
import { Parcela } from "../../domain/entities/Parcela";
import {
  CreateParcelaData,
  ListParcelasParams,
  NovedadRaw,
  ParcelaRepository,
  RegistrarNovedadData,
  UpdateParcelaData,
} from "../../domain/ports/ParcelaRepository";

// Regla de negocio "disponible para la venta": estado disponible, etapa
// actual habilitada para venta y sin ninguna suscripción activa.
const disponibleParaVentaWhere: Prisma.ParcelaWhereInput = {
  estado: "disponible",
  versionActualId: { not: null },
  etapaActual: { is: { habilitadaVenta: true } },
  versiones: { none: { suscripciones: { some: { estado: "activa" } } } },
};

const parcelaInclude = {
  finca: { select: { id: true, nombre: true } },
  etapaActual: {
    select: { id: true, nombre: true, habilitadaVenta: true, orden: true },
  },
  versionActual: true,
} satisfies Prisma.ParcelaInclude;

type ParcelaWithRelations = Prisma.ParcelaGetPayload<{
  include: typeof parcelaInclude;
}>;

// Relaciones que componen una novedad de parcela (etapa + imágenes).
const novedadInclude = {
  etapa: { select: { id: true, nombre: true, orden: true } },
  detalles: { orderBy: { createdAt: "asc" }, select: { imagenAwsId: true } },
} satisfies Prisma.NovedadParcelaInclude;

type NovedadWithRelations = Prisma.NovedadParcelaGetPayload<{
  include: typeof novedadInclude;
}>;

export class PrismaParcelaRepository implements ParcelaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateParcelaData): Promise<Parcela> {
    const created = await this.prisma.$transaction(async (tx) => {
      const parcela = await tx.parcela.create({
        data: {
          fincaId: data.fincaId,
          etapaActualId: data.etapaActualId,
          estado: data.estado,
          latitud: data.latitud,
          longitud: data.longitud,
        },
      });

      const version = await tx.versionParcela.create({
        data: {
          parcelaId: parcela.id,
          numeroVersion: 1,
          nombre: data.version.nombre,
          descripcion: data.version.descripcion,
          areaHectareas: data.version.areaHectareas,
          precioAlquiler: data.version.precioAlquiler,
        },
      });

      return tx.parcela.update({
        where: { id: parcela.id },
        data: { versionActualId: version.id },
        include: parcelaInclude,
      });
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateParcelaData): Promise<Parcela> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const current = await tx.parcela.findUniqueOrThrow({
        where: { id },
        include: { versionActual: true },
      });

      const parcelaData: Prisma.ParcelaUpdateInput = {};

      if (data.estado) {
        parcelaData.estado = data.estado;
      }

      if (data.latitud !== undefined) {
        parcelaData.latitud = data.latitud;
      }

      if (data.longitud !== undefined) {
        parcelaData.longitud = data.longitud;
      }

      // Cambio de etapa: solo actualiza el puntero de etapa actual. El
      // historial de avances ahora vive en las novedades de la parcela.
      if (
        data.etapaActualId !== undefined &&
        data.etapaActualId !== current.etapaActualId
      ) {
        parcelaData.etapaActual = data.etapaActualId
          ? { connect: { id: data.etapaActualId } }
          : { disconnect: true };
      }

      // Cambio versionable: crea una nueva versión inmutable.
      if (data.version) {
        const max = await tx.versionParcela.aggregate({
          where: { parcelaId: id },
          _max: { numeroVersion: true },
        });
        const nextVersion = (max._max.numeroVersion ?? 0) + 1;
        const prev = current.versionActual;

        const version = await tx.versionParcela.create({
          data: {
            parcelaId: id,
            numeroVersion: nextVersion,
            nombre: data.version.nombre ?? prev?.nombre ?? "",
            descripcion:
              data.version.descripcion !== undefined
                ? data.version.descripcion
                : prev?.descripcion,
            areaHectareas:
              data.version.areaHectareas !== undefined
                ? data.version.areaHectareas
                : prev?.areaHectareas,
            precioAlquiler:
              data.version.precioAlquiler ?? prev?.precioAlquiler ?? 0,
          },
        });

        parcelaData.versionActual = { connect: { id: version.id } };
      }

      return tx.parcela.update({
        where: { id },
        data: parcelaData,
        include: parcelaInclude,
      });
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Parcela | null> {
    const found = await this.prisma.parcela.findUnique({
      where: { id },
      include: parcelaInclude,
    });
    return found ? this.toDomain(found) : null;
  }

  async findMany(
    params: ListParcelasParams
  ): Promise<PaginatedResult<Parcela>> {
    const { page, limit, fincaId, estado } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ParcelaWhereInput = {};
    if (fincaId) where.fincaId = fincaId;
    if (estado) where.estado = estado;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.parcela.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: parcelaInclude,
      }),
      this.prisma.parcela.count({ where }),
    ]);

    return buildPaginatedResult(
      records.map((r) => this.toDomain(r)),
      total,
      params
    );
  }

  async findAvailableCatalog(
    params: ListCatalogParcelasInput
  ): Promise<PaginatedResult<CatalogParcelaRaw>> {
    const { page, limit, fincaId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ParcelaWhereInput = { ...disponibleParaVentaWhere };
    if (fincaId) where.fincaId = fincaId;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.parcela.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          finca: { select: { id: true, nombre: true, ubicacion: true } },
          etapaActual: { select: { nombre: true, orden: true } },
          versionActual: true,
          // Foto del estado actual: la novedad más reciente que tenga imágenes.
          novedades: {
            where: { detalles: { some: {} } },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              detalles: {
                orderBy: { createdAt: "asc" },
                take: 1,
                select: { imagenAwsId: true },
              },
            },
          },
        },
      }),
      this.prisma.parcela.count({ where }),
    ]);

    const data: CatalogParcelaRaw[] = records.map((r) => ({
      id: r.id,
      nombre: r.versionActual?.nombre ?? "",
      descripcion: r.versionActual?.descripcion ?? null,
      areaHectareas: r.versionActual?.areaHectareas?.toNumber() ?? null,
      precioAlquiler: r.versionActual?.precioAlquiler.toNumber() ?? 0,
      latitud: r.latitud?.toNumber() ?? null,
      longitud: r.longitud?.toNumber() ?? null,
      imagenActualId: r.novedades[0]?.detalles[0]?.imagenAwsId ?? null,
      finca: r.finca,
      etapaActual: r.etapaActual,
    }));

    return buildPaginatedResult(data, total, params);
  }

  async findAvailableDetail(
    id: string
  ): Promise<CatalogParcelaDetailRaw | null> {
    const parcela = await this.prisma.parcela.findFirst({
      where: { id, ...disponibleParaVentaWhere },
      include: {
        finca: {
          select: {
            id: true,
            nombre: true,
            ubicacion: true,
            municipio: true,
            departamento: true,
            altitudMetros: true,
            latitud: true,
            longitud: true,
            descripcion: true,
            imagenId: true,
          },
        },
        etapaActual: { select: { nombre: true, orden: true } },
        versionActual: true,
        // Historia de novedades (reportes de avance), de la más reciente
        // a la más antigua.
        novedades: {
          orderBy: { createdAt: "desc" },
          include: {
            etapa: { select: { nombre: true, orden: true } },
            detalles: {
              orderBy: { createdAt: "asc" },
              select: { imagenAwsId: true },
            },
          },
        },
      },
    });

    if (!parcela) {
      return null;
    }

    // Imagen actual: primera imagen de la novedad más reciente que tenga.
    const novedadConImagen = parcela.novedades.find(
      (n) => n.detalles.length > 0
    );

    return {
      id: parcela.id,
      nombre: parcela.versionActual?.nombre ?? "",
      descripcion: parcela.versionActual?.descripcion ?? null,
      areaHectareas: parcela.versionActual?.areaHectareas?.toNumber() ?? null,
      precioAlquiler: parcela.versionActual?.precioAlquiler.toNumber() ?? 0,
      latitud: parcela.latitud?.toNumber() ?? null,
      longitud: parcela.longitud?.toNumber() ?? null,
      imagenActualId: novedadConImagen?.detalles[0]?.imagenAwsId ?? null,
      finca: {
        id: parcela.finca.id,
        nombre: parcela.finca.nombre,
        ubicacion: parcela.finca.ubicacion,
        municipio: parcela.finca.municipio,
        departamento: parcela.finca.departamento,
        descripcion: parcela.finca.descripcion,
        altitudMetros: parcela.finca.altitudMetros,
        latitud: parcela.finca.latitud?.toNumber() ?? null,
        longitud: parcela.finca.longitud?.toNumber() ?? null,
        imagenId: parcela.finca.imagenId,
      },
      etapaActual: parcela.etapaActual,
      // Galería plana: todas las imágenes de todas las novedades.
      galeria: parcela.novedades.flatMap((nov) =>
        nov.detalles.map((det) => ({
          imagenId: det.imagenAwsId,
          titulo: nov.descripcion,
          fecha: nov.createdAt,
        }))
      ),
      // Historia de novedades para mostrar al cliente como "últimos reportes".
      historialNovedades: parcela.novedades.map((nov) => ({
        etapa: nov.etapa,
        fecha: nov.createdAt,
        descripcion: nov.descripcion,
        imagenes: nov.detalles.map((det) => ({ imagenId: det.imagenAwsId })),
      })),
    };
  }

  async registrarNovedad(data: RegistrarNovedadData): Promise<NovedadRaw> {
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
                create: data.imagenIds.map((imagenAwsId) => ({ imagenAwsId })),
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

  async findNovedades(parcelaId: string): Promise<NovedadRaw[]> {
    const records = await this.prisma.novedadParcela.findMany({
      where: { parcelaId },
      orderBy: { createdAt: "desc" },
      include: novedadInclude,
    });

    return records.map((r) => this.toNovedadRaw(r));
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
      imagenes: record.detalles.map((det) => ({ imagenId: det.imagenAwsId })),
    };
  }

  private toDomain(record: ParcelaWithRelations): Parcela {
    return new Parcela({
      id: record.id,
      fincaId: record.fincaId,
      estado: record.estado as EstadoParcela,
      latitud: record.latitud?.toNumber() ?? null,
      longitud: record.longitud?.toNumber() ?? null,
      etapaActualId: record.etapaActualId,
      versionActualId: record.versionActualId,
      createdAt: record.createdAt,
      finca: { id: record.finca.id, nombre: record.finca.nombre },
      etapaActual: record.etapaActual
        ? {
            id: record.etapaActual.id,
            nombre: record.etapaActual.nombre,
            habilitadaVenta: record.etapaActual.habilitadaVenta,
            orden: record.etapaActual.orden,
          }
        : null,
      versionActual: record.versionActual
        ? {
            id: record.versionActual.id,
            numeroVersion: record.versionActual.numeroVersion,
            nombre: record.versionActual.nombre,
            descripcion: record.versionActual.descripcion,
            areaHectareas:
              record.versionActual.areaHectareas?.toNumber() ?? null,
            precioAlquiler: record.versionActual.precioAlquiler.toNumber(),
          }
        : null,
    });
  }
}
