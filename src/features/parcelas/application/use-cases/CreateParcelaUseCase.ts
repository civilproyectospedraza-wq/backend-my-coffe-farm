import { Parcela } from "../../domain/entities/Parcela";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import { CreateParcelaInput } from "../dtos/ParcelaDtos";

export class CreateParcelaUseCase {
  constructor(private readonly parcelaRepository: ParcelaRepository) {}

  execute(input: CreateParcelaInput): Promise<Parcela> {
    return this.parcelaRepository.create({
      fincaId: input.fincaId,
      etapaActualId: input.etapaActualId,
      estado: input.estado,
      latitud: input.latitud,
      longitud: input.longitud,
      version: {
        nombre: input.nombre,
        descripcion: input.descripcion,
        areaHectareas: input.areaHectareas,
        precioAlquiler: input.precioAlquiler,
      },
    });
  }
}
