import { TipoIdentificacion } from "@features/propietarios/domain/entities/TipoIdentificacion";
import { EstadoRegistroCaficultor } from "../../domain/entities/EstadoRegistroCaficultor";

export interface CreateRegistroCaficultorInput {
  nombre: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoIdentificacion: TipoIdentificacion;
  identificacion: string;
}

export interface ListRegistrosCaficultorInput {
  page: number;
  limit: number;
  estado?: EstadoRegistroCaficultor;
  search?: string;
}

export interface AprobarRegistroCaficultorInput {
  id: string;
  // Administrador que aprueba (se toma del usuario autenticado).
  revisadoPor: string;
}

export interface RechazarRegistroCaficultorInput {
  id: string;
  motivo: string;
  revisadoPor: string;
}
