import { SolicitudEntregaParcelaRepository } from "../../domain/ports/SolicitudEntregaParcelaRepository";
import {
  ResumenSolicitudesEntregasParcelasInput,
  ResumenSolicitudesEntregasParcelasResponse,
} from "../dtos/SolicitudEntregaParcelaDtos";

/**
 * Resumen de solicitudes de entrega: cuántas hay en cada estado de gestión. El
 * scope de propietario llega ya resuelto desde el controlador (un Propietario
 * solo cuenta las suyas).
 */
export class GetResumenSolicitudesEntregasParcelasUseCase {
  constructor(
    private readonly solicitudRepository: SolicitudEntregaParcelaRepository
  ) {}

  async execute(
    input: ResumenSolicitudesEntregasParcelasInput
  ): Promise<ResumenSolicitudesEntregasParcelasResponse> {
    const { pendientes, enGestion, gestionadas, canceladas } =
      await this.solicitudRepository.countByEstado(input);

    return {
      pendientes,
      enGestion,
      gestionadas,
      canceladas,
      total: pendientes + enGestion + gestionadas + canceladas,
    };
  }
}
