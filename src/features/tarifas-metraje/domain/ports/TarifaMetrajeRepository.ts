import { PaginatedResult, PaginationParams } from "@shared/domain/pagination";
import { TarifaMetraje, TarifaMetrajeVersion } from "../entities/TarifaMetraje";

export interface CreateTarifaMetrajeData {
  medidaMetrosCuadrados: number;
  valorVenta: number;
  valorProduccionPropietarioPorKg: number;
  produccionKg: number;
  cantidadMinimaEntrega: number;
  createdBy?: string | null;
}

export interface CreateTarifaMetrajeVersionData {
  valorVenta: number;
  valorProduccionPropietarioPorKg: number;
  produccionKg: number;
  cantidadMinimaEntrega: number;
  createdBy?: string | null;
}

export type ListTarifasMetrajeParams = PaginationParams;

// Resultado de buscar la tarifa vigente de una parcela. Distingue los tres
// casos posibles para que el caso de uso responda el 404 adecuado.
export interface TarifaMetrajeDeParcela {
  parcelaExiste: boolean;
  tarifa: TarifaMetraje | null;
  versionActual: TarifaMetrajeVersion | null;
}

/** Puerto: persistencia de las tarifas de metraje y sus versiones. */
export interface TarifaMetrajeRepository {
  create(data: CreateTarifaMetrajeData): Promise<TarifaMetraje>;
  findById(id: string): Promise<TarifaMetraje | null>;
  // Tarifa de metraje asignada a la versión actual de una parcela, junto con la
  // versión vigente de esa tarifa.
  findByParcelaId(parcelaId: string): Promise<TarifaMetrajeDeParcela>;
  findMany(
    params: ListTarifasMetrajeParams
  ): Promise<PaginatedResult<TarifaMetraje>>;
  // Todas las tarifas (sin paginar), para selectores como el de crear/editar
  // parcela. Ordenadas por medida ascendente.
  findAll(): Promise<TarifaMetraje[]>;
  // Historial completo de versiones de una tarifa, de la más reciente a la más
  // antigua.
  findVersions(tarifaId: string): Promise<TarifaMetrajeVersion[]>;
  // Crea una versión nueva y la deja como versión actual de la tarifa.
  createVersion(
    tarifaId: string,
    data: CreateTarifaMetrajeVersionData
  ): Promise<TarifaMetrajeVersion>;
}
