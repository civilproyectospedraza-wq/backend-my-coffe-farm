import { PaginatedResult, PaginationParams } from "@shared/domain/pagination";
import { TarifaMetraje, TarifaMetrajeVersion } from "../entities/TarifaMetraje";

export interface CreateTarifaMetrajeData {
  medidaMetrosCuadrados: number;
  valor: number;
  produccionKg: number;
  createdBy?: string | null;
}

export interface CreateTarifaMetrajeVersionData {
  valor: number;
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
  // Crea una versión nueva y la deja como versión actual de la tarifa.
  createVersion(
    tarifaId: string,
    data: CreateTarifaMetrajeVersionData
  ): Promise<TarifaMetrajeVersion>;
}
