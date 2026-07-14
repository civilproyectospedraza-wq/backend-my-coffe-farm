import { PaginatedResult } from "@shared/domain/pagination";
import { RegistroCaficultor } from "../../domain/entities/RegistroCaficultor";
import { RegistroCaficultorRepository } from "../../domain/ports/RegistroCaficultorRepository";
import { ListRegistrosCaficultorInput } from "../dtos/RegistroCaficultorDtos";

export class ListRegistrosCaficultorUseCase {
  constructor(
    private readonly registroRepository: RegistroCaficultorRepository
  ) {}

  execute(
    input: ListRegistrosCaficultorInput
  ): Promise<PaginatedResult<RegistroCaficultor>> {
    return this.registroRepository.findMany(input);
  }
}
