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
  ParcelaRepository,
  UpdateParcelaData,
} from "../../domain/ports/ParcelaRepository";

// Regla de negocio "disponible para la venta": estado disponible y con versión
// actual. Al pagar una venta la parcela pasa a `ocupada`, así que el estado es
// la única condición de visibilidad (la etapa tampoco la condiciona).
const disponibleParaVentaWhere: Prisma.ParcelaWhereInput = {
  estado: "disponible",
  versionActualId: { not: null },
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
          // Imágenes fijas de portada, en el orden recibido.
          imagenes: data.imagenLocalIds?.length
            ? {
                create: data.imagenLocalIds.map((imagenLocalId, orden) => ({
                  imagenLocalId,
                  orden,
                })),
              }
            : undefined,
        },
      });

      const version = await tx.versionParcela.create({
        data: {
          parcelaId: parcela.id,
          numeroVersion: 1,
          nombre: data.version.nombre,
          descripcion: data.version.descripcion,
          areaMetrosCuadrados: data.version.areaMetrosCuadrados,
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
      // historial de avances ahora vive en los reportes de la parcela.
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
            areaMetrosCuadrados:
              data.version.areaMetrosCuadrados !== undefined
                ? data.version.areaMetrosCuadrados
                : prev?.areaMetrosCuadrados,
            precioAlquiler:
              data.version.precioAlquiler ?? prev?.precioAlquiler ?? 0,
          },
        });

        parcelaData.versionActual = { connect: { id: version.id } };
      }

      // Reemplazo de portada: borra las imágenes actuales (y sus referencias
      // ImagenLocal) y crea las nuevas en el orden recibido.
      if (data.imagenLocalIds) {
        const previas = await tx.imagenParcela.findMany({
          where: { parcelaId: id },
          select: { imagenLocalId: true },
        });
        await tx.imagenParcela.deleteMany({ where: { parcelaId: id } });
        if (previas.length) {
          await tx.imagenLocal.deleteMany({
            where: { id: { in: previas.map((p) => p.imagenLocalId) } },
          });
        }
        if (data.imagenLocalIds.length) {
          await tx.imagenParcela.createMany({
            data: data.imagenLocalIds.map((imagenLocalId, orden) => ({
              parcelaId: id,
              imagenLocalId,
              orden,
            })),
          });
        }
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
          // Galería de portada: imágenes fijas de la parcela, en orden.
          imagenes: {
            orderBy: { orden: "asc" },
            select: { imagenLocalId: true },
          },
        },
      }),
      this.prisma.parcela.count({ where }),
    ]);

    const data: CatalogParcelaRaw[] = records.map((r) => ({
      id: r.id,
      nombre: r.versionActual?.nombre ?? "",
      descripcion: r.versionActual?.descripcion ?? null,
      areaMetrosCuadrados:
        r.versionActual?.areaMetrosCuadrados?.toNumber() ?? null,
      precioAlquiler: r.versionActual?.precioAlquiler.toNumber() ?? 0,
      latitud: r.latitud?.toNumber() ?? null,
      longitud: r.longitud?.toNumber() ?? null,
      imagenesIds: r.imagenes.map((img) => img.imagenLocalId),
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
            imagenLocalId: true,
          },
        },
        etapaActual: { select: { nombre: true, orden: true } },
        versionActual: true,
        // Galería de portada: imágenes fijas de la parcela, en orden.
        imagenes: {
          orderBy: { orden: "asc" },
          select: { imagenLocalId: true, createdAt: true },
        },
        // Historia de reportes (reportes de avance), del más reciente
        // al más antiguo.
        reportes: {
          orderBy: { createdAt: "desc" },
          include: {
            etapa: { select: { nombre: true, orden: true } },
            imagenes: {
              orderBy: { createdAt: "asc" },
              select: { imagenLocalId: true },
            },
          },
        },
      },
    });

    if (!parcela) {
      return null;
    }

    return {
      id: parcela.id,
      nombre: parcela.versionActual?.nombre ?? "",
      descripcion: parcela.versionActual?.descripcion ?? null,
      areaMetrosCuadrados:
        parcela.versionActual?.areaMetrosCuadrados?.toNumber() ?? null,
      precioAlquiler: parcela.versionActual?.precioAlquiler.toNumber() ?? 0,
      latitud: parcela.latitud?.toNumber() ?? null,
      longitud: parcela.longitud?.toNumber() ?? null,
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
        imagenId: parcela.finca.imagenLocalId ?? parcela.finca.imagenId,
      },
      etapaActual: parcela.etapaActual,
      // Galería de portada: imágenes fijas de la parcela, en orden.
      galeria: parcela.imagenes.map((img) => ({
        imagenId: img.imagenLocalId,
        titulo: null,
        fecha: img.createdAt,
      })),
      // Historia de reportes para mostrar al cliente como "últimos reportes".
      historialReportes: parcela.reportes.map((rep) => ({
        etapa: rep.etapa,
        fecha: rep.createdAt,
        descripcion: rep.descripcion,
        imagenes: rep.imagenes.map((img) => ({ imagenId: img.imagenLocalId })),
      })),
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
            areaMetrosCuadrados:
              record.versionActual.areaMetrosCuadrados?.toNumber() ?? null,
            precioAlquiler: record.versionActual.precioAlquiler.toNumber(),
          }
        : null,
    });
  }
}
