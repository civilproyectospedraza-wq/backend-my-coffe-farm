import { NotFoundError } from "@shared/errors/AppError";
import { Parcela } from "../../domain/entities/Parcela";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import { UpdateParcelaInput } from "../dtos/ParcelaDtos";

export class UpdateParcelaUseCase {
  constructor(private readonly parcelaRepository: ParcelaRepository) {}

  async execute(id: string, input: UpdateParcelaInput): Promise<Parcela> {
    const parcela = await this.parcelaRepository.findById(id);
    if (!parcela) {
      throw new NotFoundError("Parcela no encontrada");
    }

    // Si cambia algún dato versionable, se generará una versión nueva.
    const hasVersionChange =
      input.nombre !== undefined ||
      input.descripcion !== undefined ||
      input.areaHectareas !== undefined ||
      input.precioAlquiler !== undefined;

    return this.parcelaRepository.update(id, {
      estado: input.estado,
      etapaActualId: input.etapaActualId,
      latitud: input.latitud,
      longitud: input.longitud,
      version: hasVersionChange
        ? {
            nombre: input.nombre,
            descripcion: input.descripcion,
            areaHectareas: input.areaHectareas,
            precioAlquiler: input.precioAlquiler,
          }
        : undefined,
    });
  }
}
