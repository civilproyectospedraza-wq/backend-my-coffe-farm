import { EstadoParcela } from "../../domain/entities/EstadoParcela";

export interface CreateParcelaInput {
  fincaId: string;
  nombre: string;
  descripcion?: string | null;
  areaHectareas?: number | null;
  precioAlquiler: number;
  etapaActualId?: string | null;
  estado?: EstadoParcela;
  latitud?: number | null;
  longitud?: number | null;
}

export interface UpdateParcelaInput {
  nombre?: string;
  descripcion?: string | null;
  areaHectareas?: number | null;
  precioAlquiler?: number;
  etapaActualId?: string | null;
  estado?: EstadoParcela;
  latitud?: number | null;
  longitud?: number | null;
}

export interface ListParcelasInput {
  page: number;
  limit: number;
  fincaId?: string;
  estado?: EstadoParcela;
}
