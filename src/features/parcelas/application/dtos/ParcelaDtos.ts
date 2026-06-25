import { EstadoParcela } from "../../domain/entities/EstadoParcela";

export interface CreateParcelaInput {
  fincaId: string;
  nombre: string;
  descripcion?: string | null;
  areaMetrosCuadrados?: number | null;
  precioAlquiler: number;
  estado?: EstadoParcela;
  latitud?: number | null;
  longitud?: number | null;
  // Si llega `etapaId`, fija la etapa actual de la parcela; de lo contrario la
  // parcela se crea sin etapa. Los reportes de avance son un flujo aparte.
  etapaId?: string;
}

export interface UpdateParcelaInput {
  nombre?: string;
  descripcion?: string | null;
  areaMetrosCuadrados?: number | null;
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
