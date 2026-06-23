import { EstadoParcela } from "../../domain/entities/EstadoParcela";

export interface CreateParcelaInput {
  fincaId: string;
  nombre: string;
  descripcion?: string | null;
  areaHectareas?: number | null;
  precioAlquiler: number;
  estado?: EstadoParcela;
  latitud?: number | null;
  longitud?: number | null;
  // Primera novedad (opcional): si llega `etapaId`, fija la etapa actual de la
  // parcela; de lo contrario la parcela se crea sin etapa.
  etapaId?: string;
  novedadDescripcion?: string | null;
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
