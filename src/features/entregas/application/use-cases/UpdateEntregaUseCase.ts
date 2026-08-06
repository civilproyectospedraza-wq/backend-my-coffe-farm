import { BadRequestError, NotFoundError } from "@shared/errors/AppError";
import {
  EntregaRaw,
  EntregaRepository,
  UpdateEntregaData,
} from "../../domain/ports/EntregaRepository";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import {
  ComprobanteImagen,
  EntregaResponse,
  UpdateEntregaInput,
} from "../dtos/EntregaDtos";

/**
 * Edita una entrega. Una actualización válida puede consistir únicamente en un
 * nuevo comprobante (que llega como archivo, no en el body). Si se sube uno
 * nuevo, se elimina el anterior del almacenamiento una vez persistido.
 */
export class UpdateEntregaUseCase {
  constructor(
    private readonly entregaRepository: EntregaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    id: string,
    input: UpdateEntregaInput,
    comprobante?: ComprobanteImagen
  ): Promise<EntregaResponse> {
    if (Object.keys(input).length === 0 && !comprobante) {
      throw new BadRequestError(
        "Debes enviar al menos un campo para actualizar"
      );
    }

    const entrega = await this.entregaRepository.findById(id);
    if (!entrega) {
      throw new NotFoundError("Entrega no encontrada");
    }

    const data: UpdateEntregaData = { ...input };

    if (comprobante) {
      const stored = await this.imageStorage.upload({
        ...comprobante,
        tipo: "comprobante-entrega",
      });
      data.imagenComprobanteId = stored.id;
    }

    const actualizada = await this.entregaRepository.update(id, data);

    // Una vez persistido el nuevo comprobante, eliminamos el anterior.
    if (comprobante && entrega.imagenComprobanteId) {
      await this.imageStorage.remove(entrega.imagenComprobanteId);
    }

    return this.toResponse(actualizada);
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
