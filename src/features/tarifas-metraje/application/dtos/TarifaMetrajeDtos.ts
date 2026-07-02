export interface CreateTarifaMetrajeInput {
  medidaMetrosCuadrados: number;
  valor: number;
  produccionKg: number;
  createdBy?: string | null;
}

export interface CreateTarifaMetrajeVersionInput {
  valor: number;
  produccionKg: number;
  createdBy?: string | null;
}

export interface ListTarifasMetrajeInput {
  page: number;
  limit: number;
}
