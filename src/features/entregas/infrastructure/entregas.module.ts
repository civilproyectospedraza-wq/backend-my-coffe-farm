import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { localImageService } from "@shared/services/images/LocalImageService";
import { CreateEntregaUseCase } from "../application/use-cases/CreateEntregaUseCase";
import { PaginateEntregasUseCase } from "../application/use-cases/PaginateEntregasUseCase";
import { UpdateEntregaUseCase } from "../application/use-cases/UpdateEntregaUseCase";
import { EntregaController } from "./http/EntregaController";
import { PrismaEntregaRepository } from "./persistence/PrismaEntregaRepository";

const entregaRepository = new PrismaEntregaRepository(prisma);

const createEntregaUseCase = new CreateEntregaUseCase(
  entregaRepository,
  localImageService
);
const updateEntregaUseCase = new UpdateEntregaUseCase(
  entregaRepository,
  localImageService
);
const paginateEntregasUseCase = new PaginateEntregasUseCase(
  entregaRepository,
  localImageService
);

export const entregaController = new EntregaController(
  createEntregaUseCase,
  updateEntregaUseCase,
  paginateEntregasUseCase
);
