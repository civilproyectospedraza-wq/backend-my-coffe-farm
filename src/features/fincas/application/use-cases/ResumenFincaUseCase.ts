import { BadRequestError, NotFoundError } from "@shared/errors/AppError";
import { FincaRepository } from "../../domain/ports/FincaRepository";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import { ResumenFinca, ResumenFincaInput } from "../dtos/FincaDtos";

export class ResumenFincaUseCase {
  constructor(
    private readonly fincaRepository: FincaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(input: ResumenFincaInput): Promise<ResumenFinca> {
    if (input.fechaInicio > input.fechaFin) {
      throw new BadRequestError(
        "La fecha de inicio no puede ser posterior a la fecha de fin"
      );
    }

    const resumen = await this.fincaRepository.getResumen(input);

    if (!resumen) {
      throw new NotFoundError("Finca no encontrada");
    }

    if (resumen.finca.imagenId) {
      resumen.finca.imagenUrl = await this.imageStorage.getPresignedUrl(
        resumen.finca.imagenId
      );
    }

    return resumen;
  }
}
