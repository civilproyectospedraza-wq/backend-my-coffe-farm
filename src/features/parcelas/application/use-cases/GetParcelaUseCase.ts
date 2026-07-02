import { NotFoundError } from "@shared/errors/AppError";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import { ParcelaDetailView } from "../dtos/ParcelaDtos";

export class GetParcelaUseCase {
  constructor(
    private readonly parcelaRepository: ParcelaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(id: string): Promise<ParcelaDetailView> {
    const parcela = await this.parcelaRepository.findById(id);
    if (!parcela) {
      throw new NotFoundError("Parcela no encontrada");
    }

    // Resuelve la URL pública de cada imagen para que el front la muestre
    // directamente; se conserva el imagenLocalId para poder eliminarlas.
    const imagenes = await Promise.all(
      parcela.imagenes.map(async (img) => ({
        imagenLocalId: img.imagenLocalId,
        url: await this.imageStorage.getPresignedUrl(img.imagenLocalId),
        orden: img.orden,
      }))
    );

    return { ...parcela, imagenes };
  }
}
