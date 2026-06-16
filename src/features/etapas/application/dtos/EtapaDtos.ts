export interface CreateEtapaInput {
  nombre: string;
  descripcion?: string | null;
  habilitadaVenta?: boolean;
  orden: number;
}

export interface UpdateEtapaInput {
  nombre?: string;
  descripcion?: string | null;
  habilitadaVenta?: boolean;
  orden?: number;
}

export interface ListEtapasInput {
  page: number;
  limit: number;
  habilitadaVenta?: boolean;
}

export interface BuscarEtapasInput {
  search?: string;
  limit: number;
}
