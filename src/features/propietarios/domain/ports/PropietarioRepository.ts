import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";
import { Propietario } from "../entities/Propietario";
import { TipoIdentificacion } from "../entities/TipoIdentificacion";

export interface CreatePropietarioData {
  usuario: {
    name: string;
    email: string;
    password: string; // ya cifrada
  };
  persona: {
    nombre: string;
    telefono?: string | null;
    direccion?: string | null;
    email?: string | null;
    tipoIdentificacion?: TipoIdentificacion | null;
    identificacion?: string | null;
  };
}

export interface ListPropietariosParams extends PaginationParams {
  /** Texto de búsqueda sobre nombre, identificación y email. */
  search?: string;
}

/** Puerto: persistencia de propietarios. */
export interface PropietarioRepository {
  create(data: CreatePropietarioData): Promise<Propietario>;
  findMany(
    params: ListPropietariosParams
  ): Promise<PaginatedResult<Propietario>>;
}
