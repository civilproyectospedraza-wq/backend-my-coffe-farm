import { NotFoundError } from "@shared/errors/AppError";
import { Parcela } from "../../domain/entities/Parcela";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";

export class GetParcelaUseCase {
  constructor(private readonly parcelaRepository: ParcelaRepository) {}

  async execute(id: string): Promise<Parcela> {
    const parcela = await this.parcelaRepository.findById(id);
    if (!parcela) {
      throw new NotFoundError("Parcela no encontrada");
    }
    return parcela;
  }
}
