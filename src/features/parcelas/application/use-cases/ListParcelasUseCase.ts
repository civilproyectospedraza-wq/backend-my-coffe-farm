import { PaginatedResult } from "@shared/domain/pagination";
import { Parcela } from "../../domain/entities/Parcela";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import { ListParcelasInput } from "../dtos/ParcelaDtos";

export class ListParcelasUseCase {
  constructor(private readonly parcelaRepository: ParcelaRepository) {}

  execute(input: ListParcelasInput): Promise<PaginatedResult<Parcela>> {
    return this.parcelaRepository.findMany(input);
  }
}
