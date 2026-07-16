import { UnauthorizedError } from "@shared/errors/AppError";
import { Rol } from "../../domain/entities/Rol";
import { PasswordHasher } from "../../domain/ports/PasswordHasher";
import { PropietarioLookup } from "../../domain/ports/PropietarioLookup";
import { TokenService } from "../../domain/ports/TokenService";
import { UserRepository } from "../../domain/ports/UserRepository";
import { AuthResult, LoginUserInput } from "../dtos/AuthDtos";

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly propietarioLookup: PropietarioLookup
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.password
    );
    if (!passwordMatches) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    // Solo los propietarios traen su id de propietario (para filtrar sus datos).
    const propietarioId =
      user.rol === Rol.Propietario
        ? (await this.propietarioLookup.findIdByUsuarioId(user.id)) ?? undefined
        : undefined;

    const token = this.tokenService.sign({
      sub: user.id,
      email: user.email,
      rol: user.rol,
      ...(propietarioId ? { propietarioId } : {}),
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rol: user.rol,
        ...(propietarioId ? { propietarioId } : {}),
      },
    };
  }
}
