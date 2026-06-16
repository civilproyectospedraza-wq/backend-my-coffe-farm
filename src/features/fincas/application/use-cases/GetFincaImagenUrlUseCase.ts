import { NotFoundError } from "@shared/errors/AppError";
import { FincaRepository } from "../../domain/ports/FincaRepository";
import { ImageStorage } from "../../domain/ports/ImageStorage";

export class GetFincaImagenUrlUseCase {
  constructor(
    private readonly fincaRepository: FincaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(id: string): Promise<string> {
    const finca = await this.fincaRepository.findById(id);
    if (!finca) {
      throw new NotFoundError("Finca no encontrada");
    }

    if (!finca.imagenId) {
      throw new NotFoundError("La finca no tiene una imagen asociada");
    }

    return this.imageStorage.getPresignedUrl(finca.imagenId);
  }
}
