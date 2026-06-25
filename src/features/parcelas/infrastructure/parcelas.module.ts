import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { localImageService } from "@shared/services/images/LocalImageService";
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

// Las imágenes de portada de la parcela se almacenan con el servicio propio
// (ImagenLocal), igual que las de los reportes.
const createParcelaUseCase = new CreateParcelaUseCase(
  parcelaRepository,
  localImageService
);
const updateParcelaUseCase = new UpdateParcelaUseCase(
  parcelaRepository,
  localImageService
);
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
  localImageService
);
const getCatalogParcelaDetailUseCase = new GetCatalogParcelaDetailUseCase(
  parcelaRepository,
  localImageService
);

export const publicParcelaController = new PublicParcelaController(
  listCatalogParcelasUseCase,
  getCatalogParcelaDetailUseCase
);
