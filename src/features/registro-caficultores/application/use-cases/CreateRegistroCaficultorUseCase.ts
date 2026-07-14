import { RegistroCaficultor } from "../../domain/entities/RegistroCaficultor";
import { RegistroCaficultorRepository } from "../../domain/ports/RegistroCaficultorRepository";
import { CreateRegistroCaficultorInput } from "../dtos/RegistroCaficultorDtos";

/**
 * Registra una solicitud de caficultor desde la landing. Queda `pendiente`
 * hasta que un administrador la apruebe; todavía NO se crea el propietario.
 */
export class CreateRegistroCaficultorUseCase {
  constructor(
    private readonly registroRepository: RegistroCaficultorRepository
  ) {}

  execute(input: CreateRegistroCaficultorInput): Promise<RegistroCaficultor> {
    return this.registroRepository.create({
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono,
      direccion: input.direccion,
      tipoIdentificacion: input.tipoIdentificacion,
      identificacion: input.identificacion,
    });
  }
}
