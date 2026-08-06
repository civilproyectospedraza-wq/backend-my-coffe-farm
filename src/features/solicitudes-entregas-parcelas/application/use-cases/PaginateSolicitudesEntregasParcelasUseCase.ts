import { PaginatedResult } from "@shared/domain/pagination";
import { SolicitudEntregaParcelaRepository } from "../../domain/ports/SolicitudEntregaParcelaRepository";
import {
  ListSolicitudesEntregasParcelasInput,
  SolicitudEntregaParcelaListItemResponse,
} from "../dtos/SolicitudEntregaParcelaDtos";

/**
 * Listado paginado de solicitudes de entrega (de la más reciente a la más
 * antigua), con filtros opcionales por parcela y estado. El scope de propietario
 * llega ya resuelto desde el controlador.
 */
export class PaginateSolicitudesEntregasParcelasUseCase {
  constructor(
    private readonly solicitudRepository: SolicitudEntregaParcelaRepository
  ) {}

  async execute(
    input: ListSolicitudesEntregasParcelasInput
  ): Promise<PaginatedResult<SolicitudEntregaParcelaListItemResponse>> {
    const result = await this.solicitudRepository.findMany(input);

    const data = result.data.map(({ solicitud, parcelaNombre, fincaNombre }) => ({
      id: solicitud.id,
      parcelaId: solicitud.parcelaId,
      cantidadKg: solicitud.cantidadKg,
      tarifaVersionId: solicitud.tarifaVersionId,
      valor: solicitud.valor,
      estado: solicitud.estado,
      createdAt: solicitud.createdAt.toISOString(),
      parcelaNombre,
      fincaNombre,
    }));

    return { ...result, data };
  }
}
