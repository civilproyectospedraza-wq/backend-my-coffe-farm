import { NotFoundError } from "@shared/errors/AppError";
import { TarifaMetrajeVersion } from "../../domain/entities/TarifaMetraje";
import { TarifaMetrajeRepository } from "../../domain/ports/TarifaMetrajeRepository";
import { CreateTarifaMetrajeVersionInput } from "../dtos/TarifaMetrajeDtos";

export class CreateTarifaMetrajeVersionUseCase {
  constructor(
    private readonly tarifaMetrajeRepository: TarifaMetrajeRepository
  ) {}

  async execute(
    tarifaId: string,
    input: CreateTarifaMetrajeVersionInput
  ): Promise<TarifaMetrajeVersion> {
    const tarifa = await this.tarifaMetrajeRepository.findById(tarifaId);
    if (!tarifa) {
      throw new NotFoundError("Tarifa de metraje no encontrada");
    }

    return this.tarifaMetrajeRepository.createVersion(tarifaId, input);
  }
}
