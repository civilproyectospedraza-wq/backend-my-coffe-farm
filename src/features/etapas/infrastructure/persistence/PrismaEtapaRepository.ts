import { Etapa as PrismaEtapa, Prisma, PrismaClient } from "@prisma/client";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import { Etapa } from "../../domain/entities/Etapa";
import {
  CreateEtapaData,
  EtapaRepository,
  ListEtapasParams,
  SearchEtapasParams,
  UpdateEtapaData,
} from "../../domain/ports/EtapaRepository";

export class PrismaEtapaRepository implements EtapaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateEtapaData): Promise<Etapa> {
    const created = await this.prisma.etapa.create({ data });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateEtapaData): Promise<Etapa> {
    const updated = await this.prisma.etapa.update({ where: { id }, data });
    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Etapa | null> {
    const found = await this.prisma.etapa.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findMany(params: ListEtapasParams): Promise<PaginatedResult<Etapa>> {
    const { page, limit, habilitadaVenta } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.EtapaWhereInput = {};
    if (habilitadaVenta !== undefined) where.habilitadaVenta = habilitadaVenta;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.etapa.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orden: "asc" },
      }),
      this.prisma.etapa.count({ where }),
    ]);

    return buildPaginatedResult(
      records.map((r) => this.toDomain(r)),
      total,
      params
    );
  }

  async search({ search, limit }: SearchEtapasParams): Promise<Etapa[]> {
    const where: Prisma.EtapaWhereInput = search
      ? { nombre: { contains: search, mode: "insensitive" } }
      : {};

    const records = await this.prisma.etapa.findMany({
      where,
      take: limit,
      orderBy: { orden: "asc" },
    });

    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: PrismaEtapa): Etapa {
    return new Etapa({
      id: record.id,
      nombre: record.nombre,
      descripcion: record.descripcion,
      habilitadaVenta: record.habilitadaVenta,
      orden: record.orden,
      createdAt: record.createdAt,
    });
  }
}
