import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { s3Service } from "@shared/services/aws/S3Service";
import { BuscarFincasUseCase } from "../application/use-cases/BuscarFincasUseCase";
import { CreateFincaUseCase } from "../application/use-cases/CreateFincaUseCase";
import { GetFincaImagenUrlUseCase } from "../application/use-cases/GetFincaImagenUrlUseCase";
import { ListFincasUseCase } from "../application/use-cases/ListFincasUseCase";
import { ResumenFincaUseCase } from "../application/use-cases/ResumenFincaUseCase";
import { UpdateFincaUseCase } from "../application/use-cases/UpdateFincaUseCase";
import { FincaController } from "./http/FincaController";
import { PrismaFincaRepository } from "./persistence/PrismaFincaRepository";

const fincaRepository = new PrismaFincaRepository(prisma);

const createFincaUseCase = new CreateFincaUseCase(fincaRepository, s3Service);
const updateFincaUseCase = new UpdateFincaUseCase(fincaRepository, s3Service);
const listFincasUseCase = new ListFincasUseCase(fincaRepository);
const resumenFincaUseCase = new ResumenFincaUseCase(fincaRepository, s3Service);
const buscarFincasUseCase = new BuscarFincasUseCase(fincaRepository);
const getFincaImagenUrlUseCase = new GetFincaImagenUrlUseCase(
  fincaRepository,
  s3Service
);

export const fincaController = new FincaController(
  createFincaUseCase,
  updateFincaUseCase,
  listFincasUseCase,
  resumenFincaUseCase,
  buscarFincasUseCase,
  getFincaImagenUrlUseCase
);
