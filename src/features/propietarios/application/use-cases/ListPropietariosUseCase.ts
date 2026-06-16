import { PaginatedResult } from "@shared/domain/pagination";
import { Propietario } from "../../domain/entities/Propietario";
import { PropietarioRepository } from "../../domain/ports/PropietarioRepository";
import { ListPropietariosInput } from "../dtos/PropietarioDtos";

export class ListPropietariosUseCase {
  constructor(private readonly propietarioRepository: PropietarioRepository) {}

  execute(input: ListPropietariosInput): Promise<PaginatedResult<Propietario>> {
    return this.propietarioRepository.findMany(input);
  }
}
