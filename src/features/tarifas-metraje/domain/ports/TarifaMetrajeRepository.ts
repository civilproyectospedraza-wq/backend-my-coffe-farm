import { PaginatedResult, PaginationParams } from "@shared/domain/pagination";
import { TarifaMetraje, TarifaMetrajeVersion } from "../entities/TarifaMetraje";

export interface CreateTarifaMetrajeData {
  medidaMetrosCuadrados: number;
  valorVenta: number;
  valorPropietario: number;
  produccionKg: number;
  createdBy?: string | null;
}

export interface CreateTarifaMetrajeVersionData {
  valorVenta: number;
  valorPropietario: number;
  produccionKg: number;
  createdBy?: string | null;
}

export type ListTarifasMetrajeParams = PaginationParams;

/** Puerto: persistencia de las tarifas de metraje y sus versiones. */
export interface TarifaMetrajeRepository {
  create(data: CreateTarifaMetrajeData): Promise<TarifaMetraje>;
  findById(id: string): Promise<TarifaMetraje | null>;
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
