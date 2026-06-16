import {
  Departamento as PrismaDepartamento,
  Municipio as PrismaMunicipio,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { Departamento } from "../../domain/entities/Departamento";
import { Municipio } from "../../domain/entities/Municipio";
import {
  SearchMunicipiosParams,
  UbicacionRepository,
} from "../../domain/ports/UbicacionRepository";

type MunicipioConDepartamento = PrismaMunicipio & {
  departamento: PrismaDepartamento;
};

export class PrismaUbicacionRepository implements UbicacionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async searchMunicipios({
    search,
    departamentoId,
    limit,
  }: SearchMunicipiosParams): Promise<Municipio[]> {
    const where: Prisma.MunicipioWhereInput = {};
    if (search) where.nombre = { contains: search, mode: "insensitive" };
    if (departamentoId !== undefined) where.departamentoId = departamentoId;

    const records = await this.prisma.municipio.findMany({
      where,
      take: limit,
      orderBy: { nombre: "asc" },
      include: { departamento: true },
    });

    const mapped = records.map((r) => this.toDomain(r));

    // Prioriza coincidencias que empiezan por el texto buscado (mejor para autocompletar).
    if (search) {
      const prefijo = search.toLocaleLowerCase();
      mapped.sort((a, b) => {
        const aStarts = a.nombre.toLocaleLowerCase().startsWith(prefijo) ? 0 : 1;
        const bStarts = b.nombre.toLocaleLowerCase().startsWith(prefijo) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.nombre.localeCompare(b.nombre);
      });
    }

    return mapped;
  }

  async listDepartamentos(): Promise<Departamento[]> {
    const records = await this.prisma.departamento.findMany({
      orderBy: { nombre: "asc" },
    });
    return records.map(
      (r) => new Departamento({ id: r.id, nombre: r.nombre })
    );
  }

  private toDomain(record: MunicipioConDepartamento): Municipio {
    return new Municipio({
      id: record.id,
      nombre: record.nombre,
      departamentoId: record.departamentoId,
      departamentoNombre: record.departamento.nombre,
    });
  }
}
