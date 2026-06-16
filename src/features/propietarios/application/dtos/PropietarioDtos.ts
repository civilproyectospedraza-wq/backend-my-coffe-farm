import { TipoIdentificacion } from "../../domain/entities/TipoIdentificacion";

export interface CreatePropietarioInput {
  // Datos usados para el usuario (login) y la persona.
  nombre: string;
  email: string;
  password: string;
  // Datos de contacto de la persona.
  telefono?: string | null;
  direccion?: string | null;
  tipoIdentificacion?: TipoIdentificacion | null;
  identificacion?: string | null;
}

export interface ListPropietariosInput {
  page: number;
  limit: number;
  search?: string;
}
