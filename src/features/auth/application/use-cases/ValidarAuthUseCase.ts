import { UnauthorizedError } from "@shared/errors/AppError";
import { UserRepository } from "../../domain/ports/UserRepository";
import { Rol } from "../../domain/entities/Rol";

export interface ValidarAuthResult {
  id: string;
  name: string;
  email: string;
  rol: Rol;
}

/**
 * Confirma que el usuario asociado al token sigue existiendo y devuelve
 * sus datos públicos. La validez del token la garantiza authMiddleware.
 */
export class ValidarAuthUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<ValidarAuthResult> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("Usuario no encontrado");
    }

    return { id: user.id, name: user.name, email: user.email, rol: user.rol };
  }
}
