import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { passwordHasher } from "@shared/services/security/PasswordHasher";
import { CreatePropietarioUseCase } from "../application/use-cases/CreatePropietarioUseCase";
import { ListPropietariosUseCase } from "../application/use-cases/ListPropietariosUseCase";
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

export const propietarioController = new PropietarioController(
  createPropietarioUseCase,
  listPropietariosUseCase
);
