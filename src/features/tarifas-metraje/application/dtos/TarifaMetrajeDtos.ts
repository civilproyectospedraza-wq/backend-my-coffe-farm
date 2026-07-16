export interface CreateTarifaMetrajeInput {
  medidaMetrosCuadrados: number;
  valorVenta: number;
  valorPropietario: number;
  produccionKg: number;
  cantidadMinimaEntrega: number;
  createdBy?: string | null;
}

export interface CreateTarifaMetrajeVersionInput {
  valorVenta: number;
  valorPropietario: number;
  produccionKg: number;
  cantidadMinimaEntrega: number;
  createdBy?: string | null;
}

export interface ListTarifasMetrajeInput {
  page: number;
  limit: number;
}

// Cada versión del historial, marcando cuál es la que está vigente.
export interface TarifaMetrajeVersionHistorialItem {
  id: string;
  tarifaMedidaId: string;
  valorVenta: number;
  valorPropietario: number;
  produccionKg: number;
  cantidadMinimaEntrega: number;
  esActual: boolean;
  createdAt: Date;
  createdBy: string | null;
}
