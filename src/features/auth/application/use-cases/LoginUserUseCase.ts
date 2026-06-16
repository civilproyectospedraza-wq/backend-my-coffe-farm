import { UnauthorizedError } from "@shared/errors/AppError";
import { PasswordHasher } from "../../domain/ports/PasswordHasher";
import { TokenService } from "../../domain/ports/TokenService";
import { UserRepository } from "../../domain/ports/UserRepository";
import { AuthResult, LoginUserInput } from "../dtos/AuthDtos";

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
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

    const token = this.tokenService.sign({
      sub: user.id,
      email: user.email,
      rol: user.rol,
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, rol: user.rol },
    };
  }
}
