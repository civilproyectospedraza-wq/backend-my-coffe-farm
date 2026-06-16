import { PaginatedResult } from "@shared/domain/pagination";
import { Finca } from "../../domain/entities/Finca";
import { FincaRepository } from "../../domain/ports/FincaRepository";
import { ListFincasInput } from "../dtos/FincaDtos";

export class ListFincasUseCase {
  constructor(private readonly fincaRepository: FincaRepository) {}

  execute(input: ListFincasInput): Promise<PaginatedResult<Finca>> {
    return this.fincaRepository.findMany(input);
  }
}
