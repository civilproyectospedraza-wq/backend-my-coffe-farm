export interface CreateTarifaMetrajeInput {
  medidaMetrosCuadrados: number;
  valorVenta: number;
  valorProduccionPropietarioPorKg: number;
  produccionKg: number;
  cantidadMinimaEntrega: number;
  createdBy?: string | null;
}

export interface CreateTarifaMetrajeVersionInput {
  valorVenta: number;
  valorProduccionPropietarioPorKg: number;
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
  valorProduccionPropietarioPorKg: number;
  produccionKg: number;
  cantidadMinimaEntrega: number;
  esActual: boolean;
  createdAt: Date;
  createdBy: string | null;
}

// Tarifa vigente de una parcela: la tarifa de metraje asignada a su versión
// actual junto con la versión vigente de esa tarifa. El front multiplica
// `versionActual.valorProduccionPropietarioPorKg` por los kg a entregar.
export interface TarifaMetrajePorParcelaResponse {
  parcelaId: string;
  tarifa: {
    id: string;
    medidaMetrosCuadrados: number;
    versionId: string | null;
    createdAt: Date;
    createdBy: string | null;
  };
  versionActual: {
    id: string;
    tarifaMedidaId: string;
    valorVenta: number;
    valorProduccionPropietarioPorKg: number;
    produccionKg: number;
    cantidadMinimaEntrega: number;
    createdAt: Date;
    createdBy: string | null;
  } | null;
}
