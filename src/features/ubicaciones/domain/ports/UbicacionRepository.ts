import { Departamento } from "../entities/Departamento";
import { Municipio } from "../entities/Municipio";

export interface SearchMunicipiosParams {
  search?: string;
  departamentoId?: number;
  limit: number;
}

/** Puerto: consulta del catálogo de ubicaciones (DIVIPOLA - DANE). */
export interface UbicacionRepository {
  searchMunicipios(params: SearchMunicipiosParams): Promise<Municipio[]>;
  listDepartamentos(): Promise<Departamento[]>;
}
