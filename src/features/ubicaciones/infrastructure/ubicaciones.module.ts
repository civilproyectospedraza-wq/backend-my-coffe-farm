import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { BuscarMunicipiosUseCase } from "../application/use-cases/BuscarMunicipiosUseCase";
import { ListDepartamentosUseCase } from "../application/use-cases/ListDepartamentosUseCase";
import { UbicacionController } from "./http/UbicacionController";
import { PrismaUbicacionRepository } from "./persistence/PrismaUbicacionRepository";

const ubicacionRepository = new PrismaUbicacionRepository(prisma);

const buscarMunicipiosUseCase = new BuscarMunicipiosUseCase(ubicacionRepository);
const listDepartamentosUseCase = new ListDepartamentosUseCase(
  ubicacionRepository
);

export const ubicacionController = new UbicacionController(
  buscarMunicipiosUseCase,
  listDepartamentosUseCase
);
