import { BcryptPasswordHasher } from "@features/auth/infrastructure/security/BcryptPasswordHasher";
import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { CompletarVentaUseCase } from "../application/use-cases/CompletarVentaUseCase";
import { CreateVentaUseCase } from "../application/use-cases/CreateVentaUseCase";
import { PaginateVentasUseCase } from "../application/use-cases/PaginateVentasUseCase";
import { VentaController } from "./http/VentaController";
import { PrismaVentaRepository } from "./persistence/PrismaVentaRepository";
import { StripePaymentGateway } from "./stripe/StripePaymentGateway";

const ventaRepository = new PrismaVentaRepository(prisma);
const paymentGateway = new StripePaymentGateway();
const passwordHasher = new BcryptPasswordHasher();

const createVentaUseCase = new CreateVentaUseCase(
  ventaRepository,
  paymentGateway
);
const completarVentaUseCase = new CompletarVentaUseCase(
  ventaRepository,
  passwordHasher
);
const paginateVentasUseCase = new PaginateVentasUseCase(ventaRepository);

export const ventaController = new VentaController(
  createVentaUseCase,
  completarVentaUseCase,
  paginateVentasUseCase,
  paymentGateway
);
