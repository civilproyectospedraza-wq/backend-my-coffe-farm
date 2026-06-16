import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { env } from "@shared/config/env";
import { LoginUserUseCase } from "../application/use-cases/LoginUserUseCase";
import { RegisterUserUseCase } from "../application/use-cases/RegisterUserUseCase";
import { ValidarAuthUseCase } from "../application/use-cases/ValidarAuthUseCase";
import { AuthController } from "./http/AuthController";
import { PrismaUserRepository } from "./persistence/PrismaUserRepository";
import { BcryptPasswordHasher } from "./security/BcryptPasswordHasher";
import { JwtTokenService } from "./security/JwtTokenService";

/**
 * Composición de la feature auth: aquí se instancian los adaptadores
 * concretos y se inyectan en los casos de uso (inversión de dependencias).
 */
const userRepository = new PrismaUserRepository(prisma);
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(env.jwt.secret, env.jwt.expiresIn);

const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  passwordHasher,
  tokenService
);
const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordHasher,
  tokenService
);
const validarAuthUseCase = new ValidarAuthUseCase(userRepository);

export const authController = new AuthController(
  registerUserUseCase,
  loginUserUseCase,
  validarAuthUseCase
);

// Exportado para que otros módulos/middlewares puedan verificar tokens.
export const authTokenService = tokenService;
