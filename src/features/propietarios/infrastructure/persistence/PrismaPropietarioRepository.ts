import { Prisma, PrismaClient } from "@prisma/client";
import { Rol } from "@features/auth/domain/entities/Rol";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import { Propietario } from "../../domain/entities/Propietario";
import { TipoIdentificacion } from "../../domain/entities/TipoIdentificacion";
import {
  CreatePropietarioData,
  ListPropietariosParams,
  PropietarioRepository,
} from "../../domain/ports/PropietarioRepository";

// Propietario con sus relaciones persona + usuario cargadas.
const propietarioInclude = {
  persona: true,
  usuario: true,
} satisfies Prisma.PropietarioInclude;

type PropietarioWithRelations = Prisma.PropietarioGetPayload<{
  include: typeof propietarioInclude;
}>;

export class PrismaPropietarioRepository implements PropietarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreatePropietarioData): Promise<Propietario> {
    const created = await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.user.create({
        data: {
          name: data.usuario.name,
          email: data.usuario.email,
          password: data.usuario.password,
          rol: "Propietario",
        },
      });

      const persona = await tx.persona.create({
        data: {
          nombre: data.persona.nombre,
          email: data.persona.email,
          telefono: data.persona.telefono,
          direccion: data.persona.direccion,
          tipoIdentificacion: data.persona.tipoIdentificacion,
          identificacion: data.persona.identificacion,
          usuarioId: usuario.id,
        },
      });

      return tx.propietario.create({
        data: { usuarioId: usuario.id, personaId: persona.id },
        include: propietarioInclude,
      });
    });

    return this.toDomain(created);
  }

  async findMany(
    params: ListPropietariosParams
  ): Promise<PaginatedResult<Propietario>> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(search);

    const [records, total] = await this.prisma.$transaction([
      this.prisma.propietario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: propietarioInclude,
      }),
      this.prisma.propietario.count({ where }),
    ]);

    return buildPaginatedResult(
      records.map((r) => this.toDomain(r)),
      total,
      params
    );
  }

  private buildWhere(search?: string): Prisma.PropietarioWhereInput {
    if (!search) return {};

    const contains = { contains: search, mode: "insensitive" as const };
    return {
      OR: [
        { persona: { nombre: contains } },
        { persona: { identificacion: contains } },
        { persona: { email: contains } },
        { usuario: { name: contains } },
        { usuario: { email: contains } },
      ],
    };
  }

  private toDomain(record: PropietarioWithRelations): Propietario {
    return new Propietario({
      id: record.id,
      usuarioId: record.usuarioId,
      personaId: record.personaId,
      createdAt: record.createdAt,
      persona: {
        id: record.persona.id,
        nombre: record.persona.nombre,
        telefono: record.persona.telefono,
        direccion: record.persona.direccion,
        email: record.persona.email,
        tipoIdentificacion: record.persona
          .tipoIdentificacion as TipoIdentificacion | null,
        identificacion: record.persona.identificacion,
      },
      usuario: {
        id: record.usuario.id,
        name: record.usuario.name,
        email: record.usuario.email,
        rol: record.usuario.rol as Rol,
      },
    });
  }
}
