import { Prisma, PrismaClient } from "@prisma/client";
import { Rol } from "@features/auth/domain/entities/Rol";
import { ConflictError } from "@shared/errors/AppError";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import {
  EstadoPropietario,
  Propietario,
} from "../../domain/entities/Propietario";
import { TipoIdentificacion } from "../../domain/entities/TipoIdentificacion";
import {
  ActivarPropietarioData,
  CreatePropietarioData,
  ListPropietariosParams,
  PropietarioDuplicados,
  PropietarioRepository,
  RegistrarPropietarioData,
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
        // Creado por un admin con usuario => nace ya activo.
        data: {
          usuarioId: usuario.id,
          personaId: persona.id,
          estado: "activo",
        },
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

  async buscarDuplicados(datos: {
    email: string;
    telefono?: string | null;
    identificacion?: string | null;
  }): Promise<PropietarioDuplicados> {
    const or: Prisma.PropietarioWhereInput[] = [
      { persona: { email: datos.email } },
    ];
    if (datos.telefono) or.push({ persona: { telefono: datos.telefono } });
    if (datos.identificacion) {
      or.push({ persona: { identificacion: datos.identificacion } });
    }

    // Solo las cuentas ACTIVAS bloquean el registro. Un registro `pendiente`
    // (abandonado, sin usuario) no cuenta: se reemplaza al volver a registrarse.
    const existentes = await this.prisma.propietario.findMany({
      where: { estado: "activo", OR: or },
      select: {
        persona: {
          select: { email: true, telefono: true, identificacion: true },
        },
      },
    });

    return {
      email: existentes.some((p) => p.persona.email === datos.email),
      telefono:
        !!datos.telefono &&
        existentes.some((p) => p.persona.telefono === datos.telefono),
      identificacion:
        !!datos.identificacion &&
        existentes.some(
          (p) => p.persona.identificacion === datos.identificacion
        ),
    };
  }

  async registrar(data: RegistrarPropietarioData): Promise<Propietario> {
    const created = await this.prisma.$transaction(async (tx) => {
      // Un registro `pendiente` previo que colisione por correo, teléfono o
      // documento se reemplaza: no tiene usuario que preservar y este nuevo
      // registro lo supersede (también evita chocar con el UNIQUE de Persona).
      const orPend: Prisma.PropietarioWhereInput[] = [
        { persona: { email: data.email } },
      ];
      if (data.telefono) orPend.push({ persona: { telefono: data.telefono } });
      if (data.identificacion) {
        orPend.push({ persona: { identificacion: data.identificacion } });
      }
      const pendientes = await tx.propietario.findMany({
        where: { estado: "pendiente", OR: orPend },
        select: { id: true, personaId: true },
      });
      if (pendientes.length) {
        await tx.propietario.deleteMany({
          where: { id: { in: pendientes.map((p) => p.id) } },
        });
        await tx.persona.deleteMany({
          where: { id: { in: pendientes.map((p) => p.personaId) } },
        });
      }

      const persona = await tx.persona.create({
        data: {
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono,
          direccion: data.direccion,
          tipoIdentificacion: data.tipoIdentificacion,
          identificacion: data.identificacion,
        },
      });

      // Nace `pendiente` y sin usuario: el User se crea al activar la cuenta.
      return tx.propietario.create({
        data: {
          personaId: persona.id,
          estado: "pendiente",
          tokenActivacion: data.tokenActivacion,
        },
        include: propietarioInclude,
      });
    });

    return this.toDomain(created);
  }

  async findByTokenActivacion(token: string): Promise<Propietario | null> {
    const record = await this.prisma.propietario.findFirst({
      where: { tokenActivacion: token },
      include: propietarioInclude,
    });
    return record ? this.toDomain(record) : null;
  }

  async activar(data: ActivarPropietarioData): Promise<Propietario> {
    const result = await this.prisma.$transaction(async (tx) => {
      const propietario = await tx.propietario.findFirst({
        where: { tokenActivacion: data.tokenActivacion },
        include: { persona: true },
      });
      if (!propietario) {
        throw new ConflictError("El enlace de activación no es válido");
      }
      if (propietario.estado === "activo" || propietario.usuarioId) {
        throw new ConflictError("La cuenta ya está activa");
      }

      const email = propietario.persona.email;
      if (!email) {
        throw new ConflictError("El propietario no tiene un correo asociado");
      }

      // La cuenta no debe existir ya (por si se creó entre el registro y la activación).
      const usuarioExistente = await tx.user.findUnique({ where: { email } });
      if (usuarioExistente) {
        throw new ConflictError("Ya existe una cuenta con ese correo");
      }

      const usuario = await tx.user.create({
        data: {
          name: propietario.persona.nombre,
          email,
          password: data.passwordHash,
          rol: "Propietario",
        },
      });

      await tx.persona.update({
        where: { id: propietario.personaId },
        data: { usuarioId: usuario.id },
      });

      return tx.propietario.update({
        where: { id: propietario.id },
        data: {
          usuarioId: usuario.id,
          estado: "activo",
          tokenActivacion: null,
          activadoAt: new Date(),
        },
        include: propietarioInclude,
      });
    });

    return this.toDomain(result);
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
      estado: record.estado as EstadoPropietario,
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
      // `pendiente` todavía no tiene usuario asociado.
      usuario: record.usuario
        ? {
            id: record.usuario.id,
            name: record.usuario.name,
            email: record.usuario.email,
            rol: record.usuario.rol as Rol,
          }
        : null,
    });
  }
}
