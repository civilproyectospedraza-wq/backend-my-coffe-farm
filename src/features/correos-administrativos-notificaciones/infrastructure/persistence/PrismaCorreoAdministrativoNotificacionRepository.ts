import {
  CorreoAdministrativoNotificacion as PrismaCorreoAdministrativoNotificacion,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import { CorreoAdministrativoNotificacion } from "../../domain/entities/CorreoAdministrativoNotificacion";
import {
  CorreoAdministrativoNotificacionRepository,
  CreateCorreoAdministrativoNotificacionData,
  ListCorreosAdministrativosNotificacionesParams,
  UpdateCorreoAdministrativoNotificacionData,
} from "../../domain/ports/CorreoAdministrativoNotificacionRepository";

export class PrismaCorreoAdministrativoNotificacionRepository
  implements CorreoAdministrativoNotificacionRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    data: CreateCorreoAdministrativoNotificacionData
  ): Promise<CorreoAdministrativoNotificacion> {
    const created = await this.prisma.correoAdministrativoNotificacion.create({
      data,
    });
    return this.toDomain(created);
  }

  async update(
    id: string,
    data: UpdateCorreoAdministrativoNotificacionData
  ): Promise<CorreoAdministrativoNotificacion> {
    const updated = await this.prisma.correoAdministrativoNotificacion.update({
      where: { id },
      data,
    });
    return this.toDomain(updated);
  }

  async findById(
    id: string
  ): Promise<CorreoAdministrativoNotificacion | null> {
    const found = await this.prisma.correoAdministrativoNotificacion.findFirst({
      where: { id, deletedAt: null },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByCorreo(
    correo: string,
    excludeId?: string
  ): Promise<CorreoAdministrativoNotificacion | null> {
    const found = await this.prisma.correoAdministrativoNotificacion.findFirst({
      where: {
        correo: { equals: correo, mode: "insensitive" },
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return found ? this.toDomain(found) : null;
  }

  async findMany(
    params: ListCorreosAdministrativosNotificacionesParams
  ): Promise<PaginatedResult<CorreoAdministrativoNotificacion>> {
    const {
      page,
      limit,
      search,
      estado,
      notificarVentasParcelas,
      notificarSolicitudesEntregaPropietarios,
    } = params;
    const skip = (page - 1) * limit;

    // Los borrados lógicamente nunca se listan.
    const where: Prisma.CorreoAdministrativoNotificacionWhereInput = {
      deletedAt: null,
    };
    if (search) {
      where.correo = { contains: search, mode: "insensitive" };
    }
    if (estado !== undefined) where.estado = estado;
    if (notificarVentasParcelas !== undefined) {
      where.notificarVentasParcelas = notificarVentasParcelas;
    }
    if (notificarSolicitudesEntregaPropietarios !== undefined) {
      where.notificarSolicitudesEntregaPropietarios =
        notificarSolicitudesEntregaPropietarios;
    }

    const [records, total] = await this.prisma.$transaction([
      this.prisma.correoAdministrativoNotificacion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.correoAdministrativoNotificacion.count({ where }),
    ]);

    return buildPaginatedResult(
      records.map((r) => this.toDomain(r)),
      total,
      params
    );
  }

  private toDomain(
    record: PrismaCorreoAdministrativoNotificacion
  ): CorreoAdministrativoNotificacion {
    return new CorreoAdministrativoNotificacion({
      id: record.id,
      correo: record.correo,
      estado: record.estado,
      notificarVentasParcelas: record.notificarVentasParcelas,
      notificarSolicitudesEntregaPropietarios:
        record.notificarSolicitudesEntregaPropietarios,
      createdAt: record.createdAt,
      deletedAt: record.deletedAt,
    });
  }
}
