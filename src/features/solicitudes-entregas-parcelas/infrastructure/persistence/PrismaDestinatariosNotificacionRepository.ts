import { PrismaClient } from "@prisma/client";
import { DestinatariosNotificacionRepository } from "../../domain/ports/DestinatariosNotificacionRepository";

export class PrismaDestinatariosNotificacionRepository
  implements DestinatariosNotificacionRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findCorreosSolicitudesEntrega(): Promise<string[]> {
    const registros =
      await this.prisma.correoAdministrativoNotificacion.findMany({
        where: {
          notificarSolicitudesEntregaPropietarios: true,
          // `estado` false deshabilita el envío sin borrar el registro, y
          // `deletedAt` marca el borrado lógico: ninguno debe recibir el aviso.
          estado: true,
          deletedAt: null,
        },
        select: { correo: true },
      });

    return registros.map((r) => r.correo);
  }
}
