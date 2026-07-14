import { ConflictError } from "@shared/errors/AppError";
import { env } from "@shared/config/env";
import { Mailer } from "@shared/services/mail/Mailer";
import { PasswordHasher } from "@shared/services/security/PasswordHasher";
import { Propietario } from "../../domain/entities/Propietario";
import { PropietarioRepository } from "../../domain/ports/PropietarioRepository";
import { ActivarPropietarioInput } from "../dtos/PropietarioDtos";

/**
 * Activación de la cuenta de un propietario. Con el token del correo y la
 * contraseña elegida crea el usuario (rol Propietario), marca la cuenta como
 * `activo` y envía el correo de confirmación con el enlace de login.
 */
export class ActivarPropietarioUseCase {
  constructor(
    private readonly propietarioRepository: PropietarioRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly mailer: Mailer
  ) {}

  async execute(input: ActivarPropietarioInput): Promise<Propietario> {
    const passwordHash = await this.passwordHasher.hash(input.password);

    const propietario = await this.propietarioRepository.activar({
      tokenActivacion: input.token,
      passwordHash,
    });

    const email = propietario.persona.email;
    if (!email) {
      // No debería ocurrir (se validó en el registro), pero se protege el envío.
      throw new ConflictError("El propietario no tiene un correo asociado");
    }

    // El envío no debe tumbar la activación: la cuenta ya quedó activa.
    try {
      await this.mailer.enviarCuentaActivada({
        nombre: propietario.persona.nombre,
        email,
        enlaceLogin: env.app.loginUrl,
      });
    } catch (error) {
      console.error(
        `No se pudo enviar el correo de cuenta activa a ${email}:`,
        error
      );
    }

    return propietario;
  }
}
