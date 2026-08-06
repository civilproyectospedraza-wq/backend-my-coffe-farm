import { PaginatedResult } from "@shared/domain/pagination";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import { ListParcelasInput, ParcelaListItemView } from "../dtos/ParcelaDtos";

export class ListParcelasUseCase {
  constructor(private readonly parcelaRepository: ParcelaRepository) {}

  async execute(
    input: ListParcelasInput
  ): Promise<PaginatedResult<ParcelaListItemView>> {
    const result = await this.parcelaRepository.findMany(input);

    const data = result.data.map(({ parcela, solicitudEntregaActiva }) => ({
      ...parcela,
      solicitud_entrega_activa: solicitudEntregaActiva,
    }));

    return { ...result, data };
  }
}
