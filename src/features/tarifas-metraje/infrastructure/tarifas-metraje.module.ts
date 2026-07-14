import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { CreateTarifaMetrajeUseCase } from "../application/use-cases/CreateTarifaMetrajeUseCase";
import { CreateTarifaMetrajeVersionUseCase } from "../application/use-cases/CreateTarifaMetrajeVersionUseCase";
import { GetTarifaMetrajeHistorialUseCase } from "../application/use-cases/GetTarifaMetrajeHistorialUseCase";
import { GetTarifaMetrajeUseCase } from "../application/use-cases/GetTarifaMetrajeUseCase";
import { ListAllTarifasMetrajeUseCase } from "../application/use-cases/ListAllTarifasMetrajeUseCase";
import { ListTarifasMetrajeUseCase } from "../application/use-cases/ListTarifasMetrajeUseCase";
import { TarifaMetrajeController } from "./http/TarifaMetrajeController";
import { PrismaTarifaMetrajeRepository } from "./persistence/PrismaTarifaMetrajeRepository";

const tarifaMetrajeRepository = new PrismaTarifaMetrajeRepository(prisma);

const createTarifaMetrajeUseCase = new CreateTarifaMetrajeUseCase(
  tarifaMetrajeRepository
);
const listTarifasMetrajeUseCase = new ListTarifasMetrajeUseCase(
  tarifaMetrajeRepository
);
const createTarifaMetrajeVersionUseCase = new CreateTarifaMetrajeVersionUseCase(
  tarifaMetrajeRepository
);
const getTarifaMetrajeUseCase = new GetTarifaMetrajeUseCase(
  tarifaMetrajeRepository
);
const listAllTarifasMetrajeUseCase = new ListAllTarifasMetrajeUseCase(
  tarifaMetrajeRepository
);
const getTarifaMetrajeHistorialUseCase = new GetTarifaMetrajeHistorialUseCase(
  tarifaMetrajeRepository
);

export const tarifaMetrajeController = new TarifaMetrajeController(
  createTarifaMetrajeUseCase,
  listTarifasMetrajeUseCase,
  createTarifaMetrajeVersionUseCase,
  getTarifaMetrajeUseCase,
  listAllTarifasMetrajeUseCase,
  getTarifaMetrajeHistorialUseCase
);
