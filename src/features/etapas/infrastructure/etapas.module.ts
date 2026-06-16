import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { BuscarEtapasUseCase } from "../application/use-cases/BuscarEtapasUseCase";
import { CreateEtapaUseCase } from "../application/use-cases/CreateEtapaUseCase";
import { ListEtapasUseCase } from "../application/use-cases/ListEtapasUseCase";
import { UpdateEtapaUseCase } from "../application/use-cases/UpdateEtapaUseCase";
import { EtapaController } from "./http/EtapaController";
import { PrismaEtapaRepository } from "./persistence/PrismaEtapaRepository";

const etapaRepository = new PrismaEtapaRepository(prisma);

const createEtapaUseCase = new CreateEtapaUseCase(etapaRepository);
const updateEtapaUseCase = new UpdateEtapaUseCase(etapaRepository);
const listEtapasUseCase = new ListEtapasUseCase(etapaRepository);
const buscarEtapasUseCase = new BuscarEtapasUseCase(etapaRepository);

export const etapaController = new EtapaController(
  createEtapaUseCase,
  updateEtapaUseCase,
  listEtapasUseCase,
  buscarEtapasUseCase
);
