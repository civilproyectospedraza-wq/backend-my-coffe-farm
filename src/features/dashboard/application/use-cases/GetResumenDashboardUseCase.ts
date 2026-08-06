import { FincaRepository } from "@features/fincas/domain/ports/FincaRepository";
import {
  DashboardRepository,
  DashboardScope,
} from "../../domain/ports/DashboardRepository";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import { DashboardResumenResponse } from "../dtos/DashboardDtos";

/**
 * Arma el resumen del panel: agregados exactos calculados en BD (COUNT/SUM),
 * las últimas entregas (con la URL del comprobante resuelta) y las últimas
 * fincas (reutilizando el repositorio de fincas para conservar la misma forma
 * que `GET /api/fincas`). Todo scopeado por propietario cuando aplica.
 */
export class GetResumenDashboardUseCase {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly fincaRepository: FincaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(scope: DashboardScope): Promise<DashboardResumenResponse> {
    const agg = await this.dashboardRepository.getResumen(scope);

    const [entregasRecientes, fincas] = await Promise.all([
      Promise.all(
        agg.entregasRecientes.map(async (entrega) => ({
          id: entrega.id,
          parcelaId: entrega.parcelaId,
          suscripcionId: entrega.suscripcionId,
          cantidadEntregada: entrega.cantidadEntregada,
          valorPagado: entrega.valorPagado,
          comprobanteUrl: entrega.imagenComprobanteId
            ? await this.imageStorage.getPresignedUrl(
                entrega.imagenComprobanteId
              )
            : null,
          createdAt: entrega.createdAt.toISOString(),
        }))
      ),
      this.fincaRepository.findMany({
        page: 1,
        limit: 5,
        propietarioId: scope.propietarioId,
      }),
    ]);

    return {
      fincasTotal: agg.fincasTotal,
      parcelasTotal: agg.parcelasOcupadas + agg.parcelasDisponibles,
      parcelasOcupadas: agg.parcelasOcupadas,
      parcelasDisponibles: agg.parcelasDisponibles,
      entregasTotal: agg.entregasTotal,
      totalCantidadEntregada: agg.totalCantidadEntregada,
      totalValorPagado: agg.totalValorPagado,
      entregasRecientes,
      fincasRecientes: fincas.data,
    };
  }
}
