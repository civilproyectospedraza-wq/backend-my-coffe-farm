import { EntregaRaw, EntregaRepository } from "../../domain/ports/EntregaRepository";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import {
  ComprobanteImagen,
  CreateEntregaInput,
  EntregaResponse,
} from "../dtos/EntregaDtos";

/**
 * Registra una entrega de café sobre una suscripción de parcela. Si viene el
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

    const entrega = await this.entregaRepository.create({
      suscripcionId: input.suscripcionId,
      cantidadEntregada: input.cantidadEntregada,
      valorPagado: input.valorPagado,
      imagenComprobanteId,
    });

    return this.toResponse(entrega);
  }

  private async toResponse(entrega: EntregaRaw): Promise<EntregaResponse> {
    const comprobanteUrl = entrega.imagenComprobanteId
      ? await this.imageStorage.getPresignedUrl(entrega.imagenComprobanteId)
      : null;

    return {
      id: entrega.id,
      suscripcionId: entrega.suscripcionId,
      cantidadEntregada: entrega.cantidadEntregada,
      valorPagado: entrega.valorPagado,
      comprobanteUrl,
      createdAt: entrega.createdAt.toISOString(),
    };
  }
}
