import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";
import { Etapa } from "../entities/Etapa";

export interface CreateEtapaData {
  nombre: string;
  descripcion?: string | null;
  habilitadaVenta?: boolean;
  orden: number;
}

export interface UpdateEtapaData {
  nombre?: string;
  descripcion?: string | null;
  habilitadaVenta?: boolean;
  orden?: number;
}

export interface ListEtapasParams extends PaginationParams {
  habilitadaVenta?: boolean;
}

export interface SearchEtapasParams {
  search?: string;
  limit: number;
}

/** Puerto: persistencia del catálogo de etapas. */
export interface EtapaRepository {
  create(data: CreateEtapaData): Promise<Etapa>;
  update(id: string, data: UpdateEtapaData): Promise<Etapa>;
  findById(id: string): Promise<Etapa | null>;
  findMany(params: ListEtapasParams): Promise<PaginatedResult<Etapa>>;
  search(params: SearchEtapasParams): Promise<Etapa[]>;
}
