import { NotFoundError } from "@shared/errors/AppError";
import { TarifaMetraje } from "../../domain/entities/TarifaMetraje";
import { TarifaMetrajeRepository } from "../../domain/ports/TarifaMetrajeRepository";

export class GetTarifaMetrajeUseCase {
  constructor(
    private readonly tarifaMetrajeRepository: TarifaMetrajeRepository
  ) {}

  async execute(id: string): Promise<TarifaMetraje> {
    const tarifa = await this.tarifaMetrajeRepository.findById(id);
    if (!tarifa) {
      throw new NotFoundError("Tarifa de metraje no encontrada");
    }
    return tarifa;
  }
}
