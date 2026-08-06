import { ConflictError, NotFoundError } from "@shared/errors/AppError";
import { CorreoAdministrativoNotificacion } from "../../domain/entities/CorreoAdministrativoNotificacion";
import { CorreoAdministrativoNotificacionRepository } from "../../domain/ports/CorreoAdministrativoNotificacionRepository";
import { UpdateCorreoAdministrativoNotificacionInput } from "../dtos/CorreoAdministrativoNotificacionDtos";

export class UpdateCorreoAdministrativoNotificacionUseCase {
  constructor(
    private readonly correoRepository: CorreoAdministrativoNotificacionRepository
  ) {}

  async execute(
    id: string,
    input: UpdateCorreoAdministrativoNotificacionInput
  ): Promise<CorreoAdministrativoNotificacion> {
    const actual = await this.correoRepository.findById(id);
    if (!actual) {
      throw new NotFoundError("Correo administrativo no encontrado");
    }

    // Al cambiar el correo, no puede chocar con otro registro vigente.
    if (input.correo && input.correo !== actual.correo) {
      const duplicado = await this.correoRepository.findByCorreo(
        input.correo,
        id
      );
      if (duplicado) {
        throw new ConflictError("El correo ya está registrado");
      }
    }

    return this.correoRepository.update(id, input);
  }
}
