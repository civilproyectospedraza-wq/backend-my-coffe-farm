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

// Registro público: el propietario se registra desde la landing. Todavía no
// define contraseña (eso ocurre al activar la cuenta).
export interface RegistrarPropietarioInput {
  nombre: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoIdentificacion?: TipoIdentificacion | null;
  identificacion?: string | null;
}

// Activación: el propietario confirma su cuenta con el token del correo y
// define su contraseña.
export interface ActivarPropietarioInput {
  token: string;
  password: string;
}
