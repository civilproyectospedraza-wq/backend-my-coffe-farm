import { ConflictError, NotFoundError } from "@shared/errors/AppError";
import { EstadoRegistroCaficultor } from "../../domain/entities/EstadoRegistroCaficultor";
import { RegistroCaficultor } from "../../domain/entities/RegistroCaficultor";
import { RegistroCaficultorRepository } from "../../domain/ports/RegistroCaficultorRepository";
import { RechazarRegistroCaficultorInput } from "../dtos/RegistroCaficultorDtos";

/** Rechaza una solicitud de caficultor pendiente, guardando el motivo. */
export class RechazarRegistroCaficultorUseCase {
  constructor(
    private readonly registroRepository: RegistroCaficultorRepository
  ) {}

  async execute(
    input: RechazarRegistroCaficultorInput
  ): Promise<RegistroCaficultor> {
    const registro = await this.registroRepository.findById(input.id);
    if (!registro) {
      throw new NotFoundError("Solicitud de registro no encontrada");
    }
    if (registro.estado !== EstadoRegistroCaficultor.pendiente) {
      throw new ConflictError(
        `La solicitud ya fue ${registro.estado}; no se puede rechazar`
      );
    }

    return this.registroRepository.rechazar(input.id, {
      motivo: input.motivo,
      revisadoPor: input.revisadoPor,
    });
  }
}
