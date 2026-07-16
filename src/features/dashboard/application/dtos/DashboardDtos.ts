import { Finca } from "@features/fincas/domain/entities/Finca";

/** Entrega ya resuelta (URL pública del comprobante) para el panel. */
export interface DashboardEntregaResponse {
  id: string;
  suscripcionId: string;
  cantidadEntregada: number;
  valorPagado: number;
  comprobanteUrl: string | null;
  createdAt: string;
}

/** Respuesta de `GET /api/dashboard/resumen`. */
export interface DashboardResumenResponse {
  fincasTotal: number;
  parcelasTotal: number;
  parcelasOcupadas: number;
  parcelasDisponibles: number;
  entregasTotal: number;
  totalCantidadEntregada: number;
  totalValorPagado: number;
  /** Hasta 5 entregas, de la más reciente a la más antigua. */
  entregasRecientes: DashboardEntregaResponse[];
  /** Hasta 5 fincas, misma forma que `GET /api/fincas`. */
  fincasRecientes: Finca[];
}
