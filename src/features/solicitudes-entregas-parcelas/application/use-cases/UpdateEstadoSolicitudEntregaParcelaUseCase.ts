import { NotFoundError } from "@shared/errors/AppError";
import { SolicitudEntregaParcelaRepository } from "../../domain/ports/SolicitudEntregaParcelaRepository";
import {
  SolicitudEntregaParcelaResponse,
  UpdateEstadoSolicitudEntregaParcelaInput,
} from "../dtos/SolicitudEntregaParcelaDtos";

/**
 * Un administrador mueve la gestión de una solicitud de entrega: de `pendiente`
 * a `en_gestion` mientras se atiende, y de ahí a `gestionada` o `cancelado`.
 */
export class UpdateEstadoSolicitudEntregaParcelaUseCase {
  constructor(
    private readonly solicitudRepository: SolicitudEntregaParcelaRepository
  ) {}

  async execute(
    input: UpdateEstadoSolicitudEntregaParcelaInput
  ): Promise<SolicitudEntregaParcelaResponse> {
    const solicitud = await this.solicitudRepository.updateEstado(
      input.id,
      input.estado
    );

    if (!solicitud) {
      throw new NotFoundError("Solicitud de entrega no encontrada");
    }

    return {
      id: solicitud.id,
      parcelaId: solicitud.parcelaId,
      cantidadKg: solicitud.cantidadKg,
      tarifaVersionId: solicitud.tarifaVersionId,
      valor: solicitud.valor,
      estado: solicitud.estado,
      createdAt: solicitud.createdAt.toISOString(),
    };
  }
}
