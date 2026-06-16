import { PasswordHasher } from "@shared/services/security/PasswordHasher";
import { Propietario } from "../../domain/entities/Propietario";
import { PropietarioRepository } from "../../domain/ports/PropietarioRepository";
import { CreatePropietarioInput } from "../dtos/PropietarioDtos";

export class CreatePropietarioUseCase {
  constructor(
    private readonly propietarioRepository: PropietarioRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: CreatePropietarioInput): Promise<Propietario> {
    const hashedPassword = await this.passwordHasher.hash(input.password);

    return this.propietarioRepository.create({
      usuario: {
        name: input.nombre,
        email: input.email,
        password: hashedPassword,
      },
      persona: {
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        direccion: input.direccion,
        tipoIdentificacion: input.tipoIdentificacion,
        identificacion: input.identificacion,
      },
    });
  }
}
