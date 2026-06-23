import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { localImageService } from "@shared/services/images/LocalImageService";
import { BuscarFincasUseCase } from "../application/use-cases/BuscarFincasUseCase";
import { CreateFincaUseCase } from "../application/use-cases/CreateFincaUseCase";
import { GetFincaImagenUrlUseCase } from "../application/use-cases/GetFincaImagenUrlUseCase";
import { ListFincasUseCase } from "../application/use-cases/ListFincasUseCase";
import { ResumenFincaUseCase } from "../application/use-cases/ResumenFincaUseCase";
import { UpdateFincaUseCase } from "../application/use-cases/UpdateFincaUseCase";
import { FincaController } from "./http/FincaController";
import { PrismaFincaRepository } from "./persistence/PrismaFincaRepository";

const fincaRepository = new PrismaFincaRepository(prisma);

const createFincaUseCase = new CreateFincaUseCase(fincaRepository, localImageService);
const updateFincaUseCase = new UpdateFincaUseCase(fincaRepository, localImageService);
const listFincasUseCase = new ListFincasUseCase(fincaRepository);
const resumenFincaUseCase = new ResumenFincaUseCase(fincaRepository, localImageService);
const buscarFincasUseCase = new BuscarFincasUseCase(fincaRepository);
const getFincaImagenUrlUseCase = new GetFincaImagenUrlUseCase(
  fincaRepository,
  localImageService
);

export const fincaController = new FincaController(
  createFincaUseCase,
  updateFincaUseCase,
  listFincasUseCase,
  resumenFincaUseCase,
  buscarFincasUseCase,
  getFincaImagenUrlUseCase
);
