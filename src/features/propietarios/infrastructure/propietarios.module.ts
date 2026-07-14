import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { passwordHasher } from "@shared/services/security/PasswordHasher";
import { mailer } from "@shared/services/mail/Mailer";
import { ActivarPropietarioUseCase } from "../application/use-cases/ActivarPropietarioUseCase";
import { CreatePropietarioUseCase } from "../application/use-cases/CreatePropietarioUseCase";
import { ListPropietariosUseCase } from "../application/use-cases/ListPropietariosUseCase";
import { RegistrarPropietarioUseCase } from "../application/use-cases/RegistrarPropietarioUseCase";
import { PropietarioController } from "./http/PropietarioController";
import { PrismaPropietarioRepository } from "./persistence/PrismaPropietarioRepository";

const propietarioRepository = new PrismaPropietarioRepository(prisma);

const createPropietarioUseCase = new CreatePropietarioUseCase(
  propietarioRepository,
  passwordHasher
);
const listPropietariosUseCase = new ListPropietariosUseCase(
  propietarioRepository
);
const registrarPropietarioUseCase = new RegistrarPropietarioUseCase(
  propietarioRepository,
  mailer
);
const activarPropietarioUseCase = new ActivarPropietarioUseCase(
  propietarioRepository,
  passwordHasher,
  mailer
);

export const propietarioController = new PropietarioController(
  createPropietarioUseCase,
  listPropietariosUseCase,
  registrarPropietarioUseCase,
  activarPropietarioUseCase
);
