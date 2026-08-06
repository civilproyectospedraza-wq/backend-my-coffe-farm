import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { CreateCorreoAdministrativoNotificacionUseCase } from "../application/use-cases/CreateCorreoAdministrativoNotificacionUseCase";
import { PaginateCorreosAdministrativosNotificacionesUseCase } from "../application/use-cases/PaginateCorreosAdministrativosNotificacionesUseCase";
import { UpdateCorreoAdministrativoNotificacionUseCase } from "../application/use-cases/UpdateCorreoAdministrativoNotificacionUseCase";
import { CorreoAdministrativoNotificacionController } from "./http/CorreoAdministrativoNotificacionController";
import { PrismaCorreoAdministrativoNotificacionRepository } from "./persistence/PrismaCorreoAdministrativoNotificacionRepository";

const correoAdministrativoNotificacionRepository =
  new PrismaCorreoAdministrativoNotificacionRepository(prisma);

const createCorreoAdministrativoNotificacionUseCase =
  new CreateCorreoAdministrativoNotificacionUseCase(
    correoAdministrativoNotificacionRepository
  );
const updateCorreoAdministrativoNotificacionUseCase =
  new UpdateCorreoAdministrativoNotificacionUseCase(
    correoAdministrativoNotificacionRepository
  );
const paginateCorreosAdministrativosNotificacionesUseCase =
  new PaginateCorreosAdministrativosNotificacionesUseCase(
    correoAdministrativoNotificacionRepository
  );

export const correoAdministrativoNotificacionController =
  new CorreoAdministrativoNotificacionController(
    createCorreoAdministrativoNotificacionUseCase,
    updateCorreoAdministrativoNotificacionUseCase,
    paginateCorreosAdministrativosNotificacionesUseCase
  );
