import { NotFoundError } from "@shared/errors/AppError";
import { TarifaMetrajeRepository } from "../../domain/ports/TarifaMetrajeRepository";
import { TarifaMetrajeVersionHistorialItem } from "../dtos/TarifaMetrajeDtos";

export class GetTarifaMetrajeHistorialUseCase {
  constructor(
    private readonly tarifaMetrajeRepository: TarifaMetrajeRepository
  ) {}

  async execute(
    tarifaId: string
  ): Promise<TarifaMetrajeVersionHistorialItem[]> {
    const tarifa = await this.tarifaMetrajeRepository.findById(tarifaId);
    if (!tarifa) {
      throw new NotFoundError("Tarifa de metraje no encontrada");
    }

    const versiones = await this.tarifaMetrajeRepository.findVersions(tarifaId);

    return versiones.map((version) => ({
      id: version.id,
      tarifaMedidaId: version.tarifaMedidaId,
      valorVenta: version.valorVenta,
      valorPropietario: version.valorPropietario,
      produccionKg: version.produccionKg,
      cantidadMinimaEntrega: version.cantidadMinimaEntrega,
      esActual: version.id === tarifa.versionId,
      createdAt: version.createdAt,
      createdBy: version.createdBy,
    }));
  }
}
