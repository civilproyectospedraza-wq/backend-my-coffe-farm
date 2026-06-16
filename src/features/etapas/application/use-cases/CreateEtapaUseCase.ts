import { Etapa } from "../../domain/entities/Etapa";
import { EtapaRepository } from "../../domain/ports/EtapaRepository";
import { CreateEtapaInput } from "../dtos/EtapaDtos";

export class CreateEtapaUseCase {
  constructor(private readonly etapaRepository: EtapaRepository) {}

  execute(input: CreateEtapaInput): Promise<Etapa> {
    return this.etapaRepository.create(input);
  }
}
