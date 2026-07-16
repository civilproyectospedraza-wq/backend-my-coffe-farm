import { UnauthorizedError } from "@shared/errors/AppError";
import { PropietarioLookup } from "../../domain/ports/PropietarioLookup";
import { UserRepository } from "../../domain/ports/UserRepository";
import { Rol } from "../../domain/entities/Rol";

export interface ValidarAuthResult {
  id: string;
  name: string;
  email: string;
  rol: Rol;
  // Presente solo cuando el usuario es Propietario.
  propietarioId?: string;
}

/**
 * Confirma que el usuario asociado al token sigue existiendo y devuelve
 * sus datos públicos. La validez del token la garantiza authMiddleware.
 */
export class ValidarAuthUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly propietarioLookup: PropietarioLookup
  ) {}

  async execute(userId: string): Promise<ValidarAuthResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("Usuario no encontrado");
    }

    // Se resuelve al vuelo (no se confía en el token) para que la sesión
    // reporte el propietarioId incluso en tokens emitidos antes de este claim.
    const propietarioId =
      user.rol === Rol.Propietario
        ? (await this.propietarioLookup.findIdByUsuarioId(user.id)) ?? undefined
        : undefined;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      rol: user.rol,
      ...(propietarioId ? { propietarioId } : {}),
    };
  }
}
