import { TarifaMetraje } from "../../domain/entities/TarifaMetraje";
import { TarifaMetrajeRepository } from "../../domain/ports/TarifaMetrajeRepository";
import { CreateTarifaMetrajeInput } from "../dtos/TarifaMetrajeDtos";

export class CreateTarifaMetrajeUseCase {
  constructor(
    private readonly tarifaMetrajeRepository: TarifaMetrajeRepository
  ) {}

  execute(input: CreateTarifaMetrajeInput): Promise<TarifaMetraje> {
    return this.tarifaMetrajeRepository.create(input);
  }
}
