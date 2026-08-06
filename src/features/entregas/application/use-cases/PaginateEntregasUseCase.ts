import { PaginatedResult } from "@shared/domain/pagination";
import { EntregaRepository } from "../../domain/ports/EntregaRepository";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import { EntregaResponse, ListEntregasInput } from "../dtos/EntregaDtos";

/**
 * Listado paginado de entregas (de la más reciente a la más antigua), con
 * filtros opcionales por parcela, suscripción o solicitud, y la URL del
 * comprobante ya resuelta.
 */
export class PaginateEntregasUseCase {
  constructor(
    private readonly entregaRepository: EntregaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    input: ListEntregasInput
  ): Promise<PaginatedResult<EntregaResponse>> {
    const result = await this.entregaRepository.findMany(input);

    const data = await Promise.all(
      result.data.map(async (entrega) => ({
        id: entrega.id,
        parcelaId: entrega.parcelaId,
        suscripcionId: entrega.suscripcionId,
        solicitudId: entrega.solicitudId,
        cantidadEntregada: entrega.cantidadEntregada,
        valorPagado: entrega.valorPagado,
        comprobanteUrl: entrega.imagenComprobanteId
          ? await this.imageStorage.getPresignedUrl(entrega.imagenComprobanteId)
          : null,
        createdAt: entrega.createdAt.toISOString(),
      }))
    );

    return { ...result, data };
  }
}
