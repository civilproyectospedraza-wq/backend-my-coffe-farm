import { Etapa } from "../../domain/entities/Etapa";
import { EtapaRepository } from "../../domain/ports/EtapaRepository";
import { BuscarEtapasInput } from "../dtos/EtapaDtos";

export class BuscarEtapasUseCase {
  constructor(private readonly etapaRepository: EtapaRepository) {}

  execute(input: BuscarEtapasInput): Promise<Etapa[]> {
    return this.etapaRepository.search(input);
  }
}
