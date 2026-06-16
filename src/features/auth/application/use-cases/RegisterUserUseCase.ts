import { ConflictError } from "@shared/errors/AppError";
import { PasswordHasher } from "../../domain/ports/PasswordHasher";
import { TokenService } from "../../domain/ports/TokenService";
import { UserRepository } from "../../domain/ports/UserRepository";
import { AuthResult, RegisterUserInput } from "../dtos/AuthDtos";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("El email ya está registrado");
    }

    const hashedPassword = await this.passwordHasher.hash(input.password);

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

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
