import { PaginatedResult } from "@shared/domain/pagination";
import { Etapa } from "../../domain/entities/Etapa";
import { EtapaRepository } from "../../domain/ports/EtapaRepository";
import { ListEtapasInput } from "../dtos/EtapaDtos";

export class ListEtapasUseCase {
  constructor(private readonly etapaRepository: EtapaRepository) {}

  execute(input: ListEtapasInput): Promise<PaginatedResult<Etapa>> {
    return this.etapaRepository.findMany(input);
  }
}
