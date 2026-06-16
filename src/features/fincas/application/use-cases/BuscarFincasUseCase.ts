import { PaginatedResult } from "@shared/domain/pagination";
import { Finca } from "../../domain/entities/Finca";
import { FincaRepository } from "../../domain/ports/FincaRepository";
import { BuscarFincasInput } from "../dtos/FincaDtos";

export class BuscarFincasUseCase {
  constructor(private readonly fincaRepository: FincaRepository) {}

  execute(input: BuscarFincasInput): Promise<PaginatedResult<Finca>> {
    return this.fincaRepository.findMany(input);
  }
}
