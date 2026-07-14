import { ConflictError, NotFoundError } from "@shared/errors/AppError";
import { PasswordHasher } from "@shared/services/security/PasswordHasher";
import { Mailer } from "@shared/services/mail/Mailer";
import { EstadoRegistroCaficultor } from "../../domain/entities/EstadoRegistroCaficultor";
import { RegistroCaficultor } from "../../domain/entities/RegistroCaficultor";
import { RegistroCaficultorRepository } from "../../domain/ports/RegistroCaficultorRepository";
import { AprobarRegistroCaficultorInput } from "../dtos/RegistroCaficultorDtos";

/**
 * Aprueba una solicitud de caficultor. Crea User + Persona + Propietario
 * (la contraseña es el número de documento) y le envía el correo de bienvenida
 * con sus datos de acceso.
 */
export class AprobarRegistroCaficultorUseCase {
  constructor(
    private readonly registroRepository: RegistroCaficultorRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly mailer: Mailer
  ) {}

  async execute(
    input: AprobarRegistroCaficultorInput
  ): Promise<RegistroCaficultor> {
    const registro = await this.registroRepository.findById(input.id);
    if (!registro) {
      throw new NotFoundError("Solicitud de registro no encontrada");
    }
    if (registro.estado !== EstadoRegistroCaficultor.pendiente) {
      throw new ConflictError(
        `La solicitud ya fue ${registro.estado}; no se puede aprobar`
      );
    }

    // La contraseña de acceso es el número de documento del caficultor.
    const passwordHash = await this.passwordHasher.hash(registro.identificacion);

    const { registro: aprobado } = await this.registroRepository.aprobar(
      input.id,
      { passwordHash, revisadoPor: input.revisadoPor }
    );

    // Correo de bienvenida con los datos de acceso. La implementación actual
    // (LogMailer) no envía nada real; se cambia por SMTP/SES en el módulo.
    await this.mailer.enviarBienvenidaCaficultor({
      nombre: aprobado.nombre,
      email: aprobado.email,
      passwordAcceso: aprobado.identificacion,
    });

    return aprobado;
  }
}
