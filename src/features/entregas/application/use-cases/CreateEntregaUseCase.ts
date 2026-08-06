import { EntregaRaw, EntregaRepository } from "../../domain/ports/EntregaRepository";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import {
  ComprobanteImagen,
  CreateEntregaInput,
  EntregaResponse,
} from "../dtos/EntregaDtos";

/**
 * Registra una entrega de café contra una solicitud `en_gestion`: la parcela
 * sale de la solicitud y esta queda `gestionada`. Los datos que llegan son los
 * reales (el admin los rectifica frente a lo que se pidió). Si viene el
 * comprobante de pago, se sube primero y luego se referencia en la entrega.
 */
export class CreateEntregaUseCase {
  constructor(
    private readonly entregaRepository: EntregaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    input: CreateEntregaInput,
    comprobante?: ComprobanteImagen
  ): Promise<EntregaResponse> {
    let imagenComprobanteId: string | null = null;
    if (comprobante) {
      const stored = await this.imageStorage.upload({
        ...comprobante,
        tipo: "comprobante-entrega",
      });
      imagenComprobanteId = stored.id;
    }

    let entrega: EntregaRaw;
    try {
      entrega = await this.entregaRepository.create({
        solicitudId: input.solicitudId,
        suscripcionId: input.suscripcionId ?? null,
        cantidadEntregada: input.cantidadEntregada,
        valorPagado: input.valorPagado,
        imagenComprobanteId,
      });
    } catch (error) {
      // La imagen se sube antes de persistir; si la entrega no se crea (p. ej.
      // la solicitud ya estaba gestionada) hay que limpiarla o queda huérfana.
      if (imagenComprobanteId) {
        await this.imageStorage
          .remove(imagenComprobanteId)
          .catch((limpiezaError) =>
            console.error(
              `No se pudo eliminar el comprobante huérfano ${imagenComprobanteId}:`,
              limpiezaError
            )
          );
      }
      throw error;
    }

    return this.toResponse(entrega);
  }

  private async toResponse(entrega: EntregaRaw): Promise<EntregaResponse> {
    const comprobanteUrl = entrega.imagenComprobanteId
      ? await this.imageStorage.getPresignedUrl(entrega.imagenComprobanteId)
      : null;

    return {
      id: entrega.id,
      parcelaId: entrega.parcelaId,
      suscripcionId: entrega.suscripcionId,
      solicitudId: entrega.solicitudId,
      cantidadEntregada: entrega.cantidadEntregada,
      valorPagado: entrega.valorPagado,
      comprobanteUrl,
      createdAt: entrega.createdAt.toISOString(),
    };
  }
}
