import { Municipio } from "../../domain/entities/Municipio";
import { UbicacionRepository } from "../../domain/ports/UbicacionRepository";
import { BuscarMunicipiosInput } from "../dtos/UbicacionDtos";

export class BuscarMunicipiosUseCase {
  constructor(private readonly ubicacionRepository: UbicacionRepository) {}

  execute(input: BuscarMunicipiosInput): Promise<Municipio[]> {
    return this.ubicacionRepository.searchMunicipios(input);
  }
}
