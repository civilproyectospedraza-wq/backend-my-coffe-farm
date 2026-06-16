import { NotFoundError } from "@shared/errors/AppError";
import { Etapa } from "../../domain/entities/Etapa";
import { EtapaRepository } from "../../domain/ports/EtapaRepository";
import { UpdateEtapaInput } from "../dtos/EtapaDtos";

export class UpdateEtapaUseCase {
  constructor(private readonly etapaRepository: EtapaRepository) {}

  async execute(id: string, input: UpdateEtapaInput): Promise<Etapa> {
    const etapa = await this.etapaRepository.findById(id);
    if (!etapa) {
      throw new NotFoundError("Etapa no encontrada");
    }

    return this.etapaRepository.update(id, input);
  }
}
