/** Scope del panel: undefined = global (Administrador); con id = ese propietario. */
export interface DashboardScope {
  propietarioId?: string;
}

/** Entrega cruda (con id de imagen sin resolver) para el panel. */
export interface DashboardEntregaRaw {
  id: string;
  parcelaId: string;
  suscripcionId: string | null;
  cantidadEntregada: number;
  valorPagado: number;
  imagenComprobanteId: string | null;
  createdAt: Date;
}

/**
 * Agregados del panel calculados en BD (COUNT/SUM/groupBy, sin traer filas a
 * memoria) y ya scopeados por propietario cuando aplica.
 */
export interface DashboardAggregates {
  fincasTotal: number;
  parcelasOcupadas: number;
  parcelasDisponibles: number;
  entregasTotal: number;
  totalCantidadEntregada: number;
  totalValorPagado: number;
  /** Hasta 5 entregas, de la más reciente a la más antigua. */
  entregasRecientes: DashboardEntregaRaw[];
}

/** Puerto: agregados del panel. */
export interface DashboardRepository {
  getResumen(scope: DashboardScope): Promise<DashboardAggregates>;
}
