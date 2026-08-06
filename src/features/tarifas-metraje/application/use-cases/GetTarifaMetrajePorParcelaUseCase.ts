import { NotFoundError } from "@shared/errors/AppError";
import { TarifaMetrajeRepository } from "../../domain/ports/TarifaMetrajeRepository";
import { TarifaMetrajePorParcelaResponse } from "../dtos/TarifaMetrajeDtos";

// Devuelve la tarifa de metraje vigente de una parcela junto con su versión
// actual, para que el front calcule el pago al propietario multiplicando
// `valorProduccionPropietarioPorKg` por los kg que va a entregar.
export class GetTarifaMetrajePorParcelaUseCase {
  constructor(
    private readonly tarifaMetrajeRepository: TarifaMetrajeRepository
  ) {}

  async execute(parcelaId: string): Promise<TarifaMetrajePorParcelaResponse> {
    const { parcelaExiste, tarifa, versionActual } =
      await this.tarifaMetrajeRepository.findByParcelaId(parcelaId);

    if (!parcelaExiste) {
      throw new NotFoundError("Parcela no encontrada");
    }
    if (!tarifa) {
      throw new NotFoundError(
        "La parcela no tiene una tarifa de metraje asignada"
      );
    }

    return {
      parcelaId,
      tarifa: {
        id: tarifa.id,
        medidaMetrosCuadrados: tarifa.medidaMetrosCuadrados,
        versionId: tarifa.versionId,
        createdAt: tarifa.createdAt,
        createdBy: tarifa.createdBy,
      },
      versionActual: versionActual
        ? {
            id: versionActual.id,
            tarifaMedidaId: versionActual.tarifaMedidaId,
            valorVenta: versionActual.valorVenta,
            valorProduccionPropietarioPorKg:
              versionActual.valorProduccionPropietarioPorKg,
            produccionKg: versionActual.produccionKg,
            cantidadMinimaEntrega: versionActual.cantidadMinimaEntrega,
            createdAt: versionActual.createdAt,
            createdBy: versionActual.createdBy,
          }
        : null,
    };
  }
}
