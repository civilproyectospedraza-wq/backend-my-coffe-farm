import { Finca as PrismaFinca, Prisma, PrismaClient } from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import {
  ResumenFinca,
  ResumenFincaInput,
} from "../../application/dtos/FincaDtos";
import { Finca } from "../../domain/entities/Finca";
import {
  CreateFincaData,
  FincaRepository,
  FindFincasParams,
  UpdateFincaData,
} from "../../domain/ports/FincaRepository";

export class PrismaFincaRepository implements FincaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateFincaData): Promise<Finca> {
    const created = await this.prisma.finca.create({ data });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateFincaData): Promise<Finca> {
    const updated = await this.prisma.finca.update({ where: { id }, data });
    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Finca | null> {
    const found = await this.prisma.finca.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findMany(params: FindFincasParams): Promise<PaginatedResult<Finca>> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.FincaWhereInput = search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { ubicacion: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [records, total] = await this.prisma.$transaction([
      this.prisma.finca.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.finca.count({ where }),
    ]);

    return buildPaginatedResult(
      records.map((r) => this.toDomain(r)),
      total,
      params
    );
  }

  async getResumen({
    fincaId,
    fechaInicio,
    fechaFin,
  }: ResumenFincaInput): Promise<ResumenFinca | null> {
    const finca = await this.prisma.finca.findUnique({
      where: { id: fincaId },
      include: {
        propietario: { include: { persona: true } },
        parcelas: {
          include: {
            etapaActual: true,
            versionActual: true,
          },
        },
      },
    });

    if (!finca) {
      return null;
    }

    const parcelaIds = finca.parcelas.map((p) => p.id);

    // Suscripciones de la finca que se solapan con el período solicitado:
    // una suscripción cuenta si estuvo vigente en algún momento del rango.
    const suscripciones = parcelaIds.length
      ? await this.prisma.suscripcion.findMany({
          where: {
            versionParcela: { parcelaId: { in: parcelaIds } },
            fechaInicio: { lte: fechaFin },
            fechaFin: { gte: fechaInicio },
          },
          select: { precioTotal: true, estado: true },
        })
      : [];

    const porEstadoParcela = { disponible: 0, ocupada: 0 };
    for (const parcela of finca.parcelas) {
      porEstadoParcela[parcela.estado] += 1;
    }

    const porEstadoAlquiler = { activa: 0, finalizada: 0, cancelada: 0 };
    let rentabilidad = 0;
    for (const s of suscripciones) {
      porEstadoAlquiler[s.estado] += 1;
      rentabilidad += s.precioTotal.toNumber();
    }

    return {
      finca: {
        id: finca.id,
        nombre: finca.nombre,
        ubicacion: finca.ubicacion,
        municipio: finca.municipio,
        departamento: finca.departamento,
        altitudMetros: finca.altitudMetros,
        latitud: finca.latitud?.toNumber() ?? null,
        longitud: finca.longitud?.toNumber() ?? null,
        descripcion: finca.descripcion,
        imagenId: finca.imagenId,
        // La URL firmada la resuelve ResumenFincaUseCase (no acoplar el repo a S3).
        imagenUrl: null,
        createdAt: finca.createdAt,
      },
      propietario: {
        id: finca.propietario.id,
        nombre: finca.propietario.persona.nombre,
        email: finca.propietario.persona.email,
        telefono: finca.propietario.persona.telefono,
        direccion: finca.propietario.persona.direccion,
        identificacion: finca.propietario.persona.identificacion,
      },
      periodo: { fechaInicio, fechaFin },
      parcelas: {
        total: finca.parcelas.length,
        porEstado: porEstadoParcela,
        detalle: finca.parcelas.map((p) => ({
          id: p.id,
          estado: p.estado,
          etapaActual: p.etapaActual?.nombre ?? null,
          nombre: p.versionActual?.nombre ?? null,
          areaHectareas: p.versionActual?.areaHectareas?.toNumber() ?? null,
          precioAlquiler: p.versionActual?.precioAlquiler.toNumber() ?? null,
        })),
      },
      alquileres: {
        total: suscripciones.length,
        porEstado: porEstadoAlquiler,
        rentabilidad,
      },
    };
  }

  private toDomain(record: PrismaFinca): Finca {
    return new Finca({
      id: record.id,
      propietarioId: record.propietarioId,
      imagenId: record.imagenId,
      nombre: record.nombre,
      ubicacion: record.ubicacion,
      municipio: record.municipio,
      departamento: record.departamento,
      altitudMetros: record.altitudMetros,
      latitud: record.latitud?.toNumber() ?? null,
      longitud: record.longitud?.toNumber() ?? null,
      descripcion: record.descripcion,
      createdAt: record.createdAt,
    });
  }
}
