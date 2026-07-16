import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { localImageService } from "@shared/services/images/LocalImageService";
import { PrismaFincaRepository } from "@features/fincas/infrastructure/persistence/PrismaFincaRepository";
import { GetResumenDashboardUseCase } from "../application/use-cases/GetResumenDashboardUseCase";
import { DashboardController } from "./http/DashboardController";
import { PrismaDashboardRepository } from "./persistence/PrismaDashboardRepository";

const dashboardRepository = new PrismaDashboardRepository(prisma);
// Se reutiliza el repositorio de fincas para que `fincasRecientes` tenga la
// misma forma que `GET /api/fincas`.
const fincaRepository = new PrismaFincaRepository(prisma);

const getResumenDashboardUseCase = new GetResumenDashboardUseCase(
  dashboardRepository,
  fincaRepository,
  localImageService
);

export const dashboardController = new DashboardController(
  getResumenDashboardUseCase
);
