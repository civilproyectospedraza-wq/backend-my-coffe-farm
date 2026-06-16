import { BadRequestError, NotFoundError } from "@shared/errors/AppError";
import { Finca } from "../../domain/entities/Finca";
import { FincaRepository } from "../../domain/ports/FincaRepository";
import {
  ImageStorage,
  UploadImagePayload,
} from "../../domain/ports/ImageStorage";
import { UpdateFincaInput } from "../dtos/FincaDtos";

export class UpdateFincaUseCase {
  constructor(
    private readonly fincaRepository: FincaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    id: string,
    input: UpdateFincaInput,
    imagen?: UploadImagePayload
  ): Promise<Finca> {
    if (Object.keys(input).length === 0 && !imagen) {
      throw new BadRequestError("Debes enviar al menos un campo para actualizar");
    }

    const finca = await this.fincaRepository.findById(id);
    if (!finca) {
      throw new NotFoundError("Finca no encontrada");
    }

    const data: UpdateFincaInput & { imagenId?: string | null } = { ...input };

    if (imagen) {
      const stored = await this.imageStorage.upload({ ...imagen, tipo: "finca" });
      data.imagenId = stored.id;
    }

    const actualizada = await this.fincaRepository.update(id, data);

    // Una vez persistida la nueva imagen, eliminamos la anterior de S3.
    if (imagen && finca.imagenId) {
      await this.imageStorage.remove(finca.imagenId);
    }

    return actualizada;
  }
}
