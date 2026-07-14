import { Prisma, PrismaClient } from "@prisma/client";
import { ConflictError } from "@shared/errors/AppError";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import { TipoIdentificacion } from "@features/propietarios/domain/entities/TipoIdentificacion";
import { EstadoRegistroCaficultor } from "../../domain/entities/EstadoRegistroCaficultor";
import { RegistroCaficultor } from "../../domain/entities/RegistroCaficultor";
import {
  AprobarRegistroData,
  AprobarRegistroResult,
  CreateRegistroCaficultorData,
  ListRegistrosCaficultorParams,
  RechazarRegistroData,
  RegistroCaficultorRepository,
} from "../../domain/ports/RegistroCaficultorRepository";

type RegistroRecord = Prisma.RegistroCaficultorGetPayload<true>;

export class PrismaRegistroCaficultorRepository
  implements RegistroCaficultorRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    data: CreateRegistroCaficultorData
  ): Promise<RegistroCaficultor> {
    // Evita duplicados: cuenta ya existente o solicitud pendiente repetida.
    const usuarioExistente = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (usuarioExistente) {
      throw new ConflictError("Ya existe una cuenta con ese correo");
    }

    const solicitudPendiente = await this.prisma.registroCaficultor.findFirst({
      where: {
        estado: "pendiente",
        OR: [{ email: data.email }, { identificacion: data.identificacion }],
      },
    });
    if (solicitudPendiente) {
      throw new ConflictError(
        "Ya existe una solicitud pendiente con ese correo o documento"
      );
    }

    const created = await this.prisma.registroCaficultor.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        tipoIdentificacion: data.tipoIdentificacion,
        identificacion: data.identificacion,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<RegistroCaficultor | null> {
    const record = await this.prisma.registroCaficultor.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findMany(
    params: ListRegistrosCaficultorParams
  ): Promise<PaginatedResult<RegistroCaficultor>> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(params);

    const [records, total] = await this.prisma.$transaction([
      this.prisma.registroCaficultor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.registroCaficultor.count({ where }),
    ]);

    return buildPaginatedResult(
      records.map((r) => this.toDomain(r)),
      total,
      params
    );
  }

  async aprobar(
    id: string,
    data: AprobarRegistroData
  ): Promise<AprobarRegistroResult> {
    const result = await this.prisma.$transaction(async (tx) => {
      const registro = await tx.registroCaficultor.findUnique({
        where: { id },
      });
      if (!registro) {
        throw new ConflictError("La solicitud ya no existe");
      }
      if (registro.estado !== "pendiente") {
        throw new ConflictError(
          `La solicitud ya fue ${registro.estado}; no se puede aprobar`
        );
      }

      // La cuenta no debe existir ya (por si se creó entre el registro y la aprobación).
      const usuarioExistente = await tx.user.findUnique({
        where: { email: registro.email },
      });
      if (usuarioExistente) {
        throw new ConflictError("Ya existe una cuenta con ese correo");
      }

      const usuario = await tx.user.create({
        data: {
          name: registro.nombre,
          email: registro.email,
          password: data.passwordHash,
          rol: "Propietario",
        },
      });

      const persona = await tx.persona.create({
        data: {
          nombre: registro.nombre,
          email: registro.email,
          telefono: registro.telefono,
          direccion: registro.direccion,
          tipoIdentificacion: registro.tipoIdentificacion,
          identificacion: registro.identificacion,
          usuarioId: usuario.id,
        },
      });

      const propietario = await tx.propietario.create({
        data: { usuarioId: usuario.id, personaId: persona.id },
      });

      const actualizado = await tx.registroCaficultor.update({
        where: { id },
        data: {
          estado: "aprobado",
          propietarioId: propietario.id,
          revisadoPor: data.revisadoPor,
          revisadoAt: new Date(),
        },
      });

      return { registro: actualizado, propietarioId: propietario.id };
    });

    return {
      registro: this.toDomain(result.registro),
      propietarioId: result.propietarioId,
    };
  }

  async rechazar(
    id: string,
    data: RechazarRegistroData
  ): Promise<RegistroCaficultor> {
    const updated = await this.prisma.registroCaficultor.update({
      where: { id },
      data: {
        estado: "rechazado",
        motivoRechazo: data.motivo,
        revisadoPor: data.revisadoPor,
        revisadoAt: new Date(),
      },
    });
    return this.toDomain(updated);
  }

  private buildWhere(
    params: ListRegistrosCaficultorParams
  ): Prisma.RegistroCaficultorWhereInput {
    const where: Prisma.RegistroCaficultorWhereInput = {};
    if (params.estado) where.estado = params.estado;

    if (params.search) {
      const contains = { contains: params.search, mode: "insensitive" as const };
      where.OR = [
        { nombre: contains },
        { email: contains },
        { identificacion: contains },
      ];
    }
    return where;
  }

  private toDomain(record: RegistroRecord): RegistroCaficultor {
    return new RegistroCaficultor({
      id: record.id,
      nombre: record.nombre,
      email: record.email,
      telefono: record.telefono,
      direccion: record.direccion,
      tipoIdentificacion: record.tipoIdentificacion as TipoIdentificacion,
      identificacion: record.identificacion,
      estado: record.estado as EstadoRegistroCaficultor,
      motivoRechazo: record.motivoRechazo,
      propietarioId: record.propietarioId,
      revisadoPor: record.revisadoPor,
      revisadoAt: record.revisadoAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
