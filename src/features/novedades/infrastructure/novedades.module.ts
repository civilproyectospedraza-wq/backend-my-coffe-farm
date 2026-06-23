import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { localImageService } from "@shared/services/images/LocalImageService";
import { CreateNovedadUseCase } from "../application/use-cases/CreateNovedadUseCase";
import { PaginateNovedadesUseCase } from "../application/use-cases/PaginateNovedadesUseCase";
import { NovedadController } from "./http/NovedadController";
import { PrismaNovedadRepository } from "./persistence/PrismaNovedadRepository";

const novedadRepository = new PrismaNovedadRepository(prisma);

// Se exporta para reutilizarlo al crear una parcela (primera novedad).
export const createNovedadUseCase = new CreateNovedadUseCase(
  novedadRepository,
  localImageService
);
const paginateNovedadesUseCase = new PaginateNovedadesUseCase(
  novedadRepository,
  localImageService
);

export const novedadController = new NovedadController(
  createNovedadUseCase,
  paginateNovedadesUseCase
);
