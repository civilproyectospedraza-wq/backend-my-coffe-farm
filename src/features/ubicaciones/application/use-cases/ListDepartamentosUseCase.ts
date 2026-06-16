import { Departamento } from "../../domain/entities/Departamento";
import { UbicacionRepository } from "../../domain/ports/UbicacionRepository";

export class ListDepartamentosUseCase {
  constructor(private readonly ubicacionRepository: UbicacionRepository) {}

  execute(): Promise<Departamento[]> {
    return this.ubicacionRepository.listDepartamentos();
  }
}
