import { Finca } from "../../domain/entities/Finca";
import { FincaRepository } from "../../domain/ports/FincaRepository";
import {
  ImageStorage,
  UploadImagePayload,
} from "../../domain/ports/ImageStorage";
import { CreateFincaInput } from "../dtos/FincaDtos";

export class CreateFincaUseCase {
  constructor(
    private readonly fincaRepository: FincaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    input: CreateFincaInput,
    imagen?: UploadImagePayload
  ): Promise<Finca> {
    let imagenId: string | null = null;

    if (imagen) {
      const stored = await this.imageStorage.upload({ ...imagen, tipo: "finca" });
      imagenId = stored.id;
    }

    return this.fincaRepository.create({ ...input, imagenId });
  }
}
