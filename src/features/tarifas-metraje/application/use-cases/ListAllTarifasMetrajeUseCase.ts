import { TarifaMetraje } from "../../domain/entities/TarifaMetraje";
import { TarifaMetrajeRepository } from "../../domain/ports/TarifaMetrajeRepository";

/**
 * Devuelve todas las tarifas de metraje sin paginar, pensado para poblar el
 * selector de tarifa en los formularios de crear/editar parcela.
 */
export class ListAllTarifasMetrajeUseCase {
  constructor(
    private readonly tarifaMetrajeRepository: TarifaMetrajeRepository
  ) {}

  execute(): Promise<TarifaMetraje[]> {
    return this.tarifaMetrajeRepository.findAll();
  }
}
