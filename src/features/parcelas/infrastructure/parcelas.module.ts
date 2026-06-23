import { createNovedadUseCase } from "@features/novedades/infrastructure/novedades.module";
import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { s3Service } from "@shared/services/aws/S3Service";
import { CreateParcelaUseCase } from "../application/use-cases/CreateParcelaUseCase";
import { GetCatalogParcelaDetailUseCase } from "../application/use-cases/GetCatalogParcelaDetailUseCase";
import { GetParcelaUseCase } from "../application/use-cases/GetParcelaUseCase";
import { ListCatalogParcelasUseCase } from "../application/use-cases/ListCatalogParcelasUseCase";
import { ListParcelasUseCase } from "../application/use-cases/ListParcelasUseCase";
import { UpdateParcelaUseCase } from "../application/use-cases/UpdateParcelaUseCase";
import { ParcelaController } from "./http/ParcelaController";
import { PublicParcelaController } from "./http/PublicParcelaController";
import { PrismaParcelaRepository } from "./persistence/PrismaParcelaRepository";

const parcelaRepository = new PrismaParcelaRepository(prisma);

// Reusa el caso de uso de novedades para la primera novedad de la parcela.
const createParcelaUseCase = new CreateParcelaUseCase(
  parcelaRepository,
  createNovedadUseCase
);
const updateParcelaUseCase = new UpdateParcelaUseCase(parcelaRepository);
const listParcelasUseCase = new ListParcelasUseCase(parcelaRepository);
const getParcelaUseCase = new GetParcelaUseCase(parcelaRepository);

export const parcelaController = new ParcelaController(
  createParcelaUseCase,
  updateParcelaUseCase,
  listParcelasUseCase,
  getParcelaUseCase
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
