import { ConflictError } from "@shared/errors/AppError";
import { CorreoAdministrativoNotificacion } from "../../domain/entities/CorreoAdministrativoNotificacion";
import { CorreoAdministrativoNotificacionRepository } from "../../domain/ports/CorreoAdministrativoNotificacionRepository";
import { CreateCorreoAdministrativoNotificacionInput } from "../dtos/CorreoAdministrativoNotificacionDtos";

export class CreateCorreoAdministrativoNotificacionUseCase {
  constructor(
    private readonly correoRepository: CorreoAdministrativoNotificacionRepository
  ) {}

  async execute(
    input: CreateCorreoAdministrativoNotificacionInput
  ): Promise<CorreoAdministrativoNotificacion> {
    const existente = await this.correoRepository.findByCorreo(input.correo);
    if (existente) {
      throw new ConflictError("El correo ya está registrado");
    }

    // Las banderas de notificación son opcionales para el front: por defecto false.
    return this.correoRepository.create({
      correo: input.correo,
      estado: input.estado,
      notificarVentasParcelas: input.notificarVentasParcelas ?? false,
      notificarSolicitudesEntregaPropietarios:
        input.notificarSolicitudesEntregaPropietarios ?? false,
    });
  }
}
