import { PaginatedResult } from "@shared/domain/pagination";
import { TarifaMetraje } from "../../domain/entities/TarifaMetraje";
import { TarifaMetrajeRepository } from "../../domain/ports/TarifaMetrajeRepository";
import { ListTarifasMetrajeInput } from "../dtos/TarifaMetrajeDtos";

export class ListTarifasMetrajeUseCase {
  constructor(
    private readonly tarifaMetrajeRepository: TarifaMetrajeRepository
  ) {}

  execute(
    input: ListTarifasMetrajeInput
  ): Promise<PaginatedResult<TarifaMetraje>> {
    return this.tarifaMetrajeRepository.findMany(input);
  }
}
