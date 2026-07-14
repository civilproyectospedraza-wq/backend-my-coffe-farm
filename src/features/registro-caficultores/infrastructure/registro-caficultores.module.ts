import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { passwordHasher } from "@shared/services/security/PasswordHasher";
import { mailer } from "@shared/services/mail/Mailer";
import { AprobarRegistroCaficultorUseCase } from "../application/use-cases/AprobarRegistroCaficultorUseCase";
import { CreateRegistroCaficultorUseCase } from "../application/use-cases/CreateRegistroCaficultorUseCase";
import { ListRegistrosCaficultorUseCase } from "../application/use-cases/ListRegistrosCaficultorUseCase";
import { RechazarRegistroCaficultorUseCase } from "../application/use-cases/RechazarRegistroCaficultorUseCase";
import { RegistroCaficultorController } from "./http/RegistroCaficultorController";
import { PrismaRegistroCaficultorRepository } from "./persistence/PrismaRegistroCaficultorRepository";

const registroRepository = new PrismaRegistroCaficultorRepository(prisma);

const createUseCase = new CreateRegistroCaficultorUseCase(registroRepository);
const listUseCase = new ListRegistrosCaficultorUseCase(registroRepository);
const aprobarUseCase = new AprobarRegistroCaficultorUseCase(
  registroRepository,
  passwordHasher,
  mailer
);
const rechazarUseCase = new RechazarRegistroCaficultorUseCase(
  registroRepository
);

export const registroCaficultorController = new RegistroCaficultorController(
  createUseCase,
  listUseCase,
  aprobarUseCase,
  rechazarUseCase
);
