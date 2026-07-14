import { randomUUID } from "node:crypto";
import { ConflictError } from "@shared/errors/AppError";
import { env } from "@shared/config/env";
import { Mailer } from "@shared/services/mail/Mailer";
import { Propietario } from "../../domain/entities/Propietario";
import { PropietarioRepository } from "../../domain/ports/PropietarioRepository";
import { RegistrarPropietarioInput } from "../dtos/PropietarioDtos";

/**
 * Registro público de un propietario desde la landing. Valida que el correo,
 * teléfono y documento no pertenezcan ya a otro propietario, crea el registro
 * en estado `pendiente` con un token de activación y envía el correo de
 * agradecimiento con el enlace para activar la cuenta.
 */
export class RegistrarPropietarioUseCase {
  constructor(
    private readonly propietarioRepository: PropietarioRepository,
    private readonly mailer: Mailer
  ) {}

  async execute(input: RegistrarPropietarioInput): Promise<Propietario> {
    const duplicados = await this.propietarioRepository.buscarDuplicados({
      email: input.email,
      telefono: input.telefono,
      identificacion: input.identificacion,
    });

    const conflictos: string[] = [];
    if (duplicados.email) conflictos.push("el correo");
    if (duplicados.telefono) conflictos.push("el teléfono");
    if (duplicados.identificacion) conflictos.push("el documento");
    if (conflictos.length > 0) {
      throw new ConflictError(
        `Ya existe un propietario registrado con ${conflictos.join(", ")}`
      );
    }

    const tokenActivacion = randomUUID();

    const propietario = await this.propietarioRepository.registrar({
      nombre: input.nombre,
      email: input.email,
      telefono: input.telefono,
      direccion: input.direccion,
      tipoIdentificacion: input.tipoIdentificacion,
      identificacion: input.identificacion,
      tokenActivacion,
    });

    const enlaceActivacion = `${env.app.activacionUrl}?token=${tokenActivacion}`;

    // El envío del correo no debe tumbar el registro: si falla, se registra y
    // el propietario queda `pendiente` (puede reintentarse el reenvío).
    try {
      await this.mailer.enviarActivacionPropietario({
        nombre: input.nombre,
        email: input.email,
        enlaceActivacion,
      });
    } catch (error) {
      console.error(
        `No se pudo enviar el correo de activación a ${input.email}:`,
        error
      );
    }

    return propietario;
  }
}
