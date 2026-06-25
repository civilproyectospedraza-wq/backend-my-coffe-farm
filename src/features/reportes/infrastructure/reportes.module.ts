import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { localImageService } from "@shared/services/images/LocalImageService";
import { CreateReporteUseCase } from "../application/use-cases/CreateReporteUseCase";
import { PaginateReportesUseCase } from "../application/use-cases/PaginateReportesUseCase";
import { ReporteController } from "./http/ReporteController";
import { PrismaReporteRepository } from "./persistence/PrismaReporteRepository";

const reporteRepository = new PrismaReporteRepository(prisma);

// Se exporta para reutilizarlo al crear una parcela (primer reporte).
export const createReporteUseCase = new CreateReporteUseCase(
  reporteRepository,
  localImageService
);
const paginateReportesUseCase = new PaginateReportesUseCase(
  reporteRepository,
  localImageService
);

export const reporteController = new ReporteController(
  createReporteUseCase,
  paginateReportesUseCase
);
