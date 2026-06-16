import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { s3Service } from "@shared/services/aws/S3Service";
import { CreateParcelaUseCase } from "../application/use-cases/CreateParcelaUseCase";
import { GetCatalogParcelaDetailUseCase } from "../application/use-cases/GetCatalogParcelaDetailUseCase";
import { GetParcelaUseCase } from "../application/use-cases/GetParcelaUseCase";
import { ListCatalogParcelasUseCase } from "../application/use-cases/ListCatalogParcelasUseCase";
import { ListNovedadesParcelaUseCase } from "../application/use-cases/ListNovedadesParcelaUseCase";
import { ListParcelasUseCase } from "../application/use-cases/ListParcelasUseCase";
import { RegistrarNovedadParcelaUseCase } from "../application/use-cases/RegistrarNovedadParcelaUseCase";
import { UpdateParcelaUseCase } from "../application/use-cases/UpdateParcelaUseCase";
import { ParcelaController } from "./http/ParcelaController";
import { PublicParcelaController } from "./http/PublicParcelaController";
import { PrismaParcelaRepository } from "./persistence/PrismaParcelaRepository";

const parcelaRepository = new PrismaParcelaRepository(prisma);

const createParcelaUseCase = new CreateParcelaUseCase(parcelaRepository);
const updateParcelaUseCase = new UpdateParcelaUseCase(parcelaRepository);
const listParcelasUseCase = new ListParcelasUseCase(parcelaRepository);
const getParcelaUseCase = new GetParcelaUseCase(parcelaRepository);
const registrarNovedadUseCase = new RegistrarNovedadParcelaUseCase(
  parcelaRepository,
  s3Service
);
const listNovedadesUseCase = new ListNovedadesParcelaUseCase(
  parcelaRepository,
  s3Service
);

export const parcelaController = new ParcelaController(
  createParcelaUseCase,
  updateParcelaUseCase,
  listParcelasUseCase,
  getParcelaUseCase,
  registrarNovedadUseCase,
  listNovedadesUseCase
);

// --- Catálogo público ---
const listCatalogParcelasUseCase = new ListCatalogParcelasUseCase(
  parcelaRepository,
  s3Service
);
const getCatalogParcelaDetailUseCase = new GetCatalogParcelaDetailUseCase(
  parcelaRepository,
  s3Service
);

export const publicParcelaController = new PublicParcelaController(
  listCatalogParcelasUseCase,
  getCatalogParcelaDetailUseCase
);
