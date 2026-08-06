import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { mailer } from "@shared/services/mail/Mailer";
import { CreateSolicitudEntregaParcelaUseCase } from "../application/use-cases/CreateSolicitudEntregaParcelaUseCase";
import { GetResumenSolicitudesEntregasParcelasUseCase } from "../application/use-cases/GetResumenSolicitudesEntregasParcelasUseCase";
import { PaginateSolicitudesEntregasParcelasUseCase } from "../application/use-cases/PaginateSolicitudesEntregasParcelasUseCase";
import { UpdateEstadoSolicitudEntregaParcelaUseCase } from "../application/use-cases/UpdateEstadoSolicitudEntregaParcelaUseCase";
import { SolicitudEntregaParcelaController } from "./http/SolicitudEntregaParcelaController";
import { PrismaDestinatariosNotificacionRepository } from "./persistence/PrismaDestinatariosNotificacionRepository";
import { PrismaSolicitudEntregaParcelaRepository } from "./persistence/PrismaSolicitudEntregaParcelaRepository";

const solicitudEntregaParcelaRepository =
  new PrismaSolicitudEntregaParcelaRepository(prisma);
const destinatariosNotificacionRepository =
  new PrismaDestinatariosNotificacionRepository(prisma);

const createSolicitudEntregaParcelaUseCase =
  new CreateSolicitudEntregaParcelaUseCase(
    solicitudEntregaParcelaRepository,
    destinatariosNotificacionRepository,
    mailer
  );

const paginateSolicitudesEntregasParcelasUseCase =
  new PaginateSolicitudesEntregasParcelasUseCase(
    solicitudEntregaParcelaRepository
  );

const getResumenSolicitudesEntregasParcelasUseCase =
  new GetResumenSolicitudesEntregasParcelasUseCase(
    solicitudEntregaParcelaRepository
  );

const updateEstadoSolicitudEntregaParcelaUseCase =
  new UpdateEstadoSolicitudEntregaParcelaUseCase(
    solicitudEntregaParcelaRepository
  );

export const solicitudEntregaParcelaController =
  new SolicitudEntregaParcelaController(
    createSolicitudEntregaParcelaUseCase,
    paginateSolicitudesEntregasParcelasUseCase,
    getResumenSolicitudesEntregasParcelasUseCase,
    updateEstadoSolicitudEntregaParcelaUseCase
  );
