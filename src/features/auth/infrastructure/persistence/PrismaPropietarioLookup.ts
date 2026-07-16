import { PrismaClient } from "@prisma/client";
import { PropietarioLookup } from "../../domain/ports/PropietarioLookup";

/** Implementación con Prisma: consulta la tabla `propietarios` por `usuarioId`. */
export class PrismaPropietarioLookup implements PropietarioLookup {
  constructor(private readonly prisma: PrismaClient) {}

  async findIdByUsuarioId(usuarioId: string): Promise<string | null> {
    const propietario = await this.prisma.propietario.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
    return propietario?.id ?? null;
  }
}
