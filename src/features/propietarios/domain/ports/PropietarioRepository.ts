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

// Datos del registro público: crea Persona + Propietario en estado `pendiente`
// (sin usuario todavía) con el token de activación generado en la aplicación.
export interface RegistrarPropietarioData {
  nombre: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoIdentificacion?: TipoIdentificacion | null;
  identificacion?: string | null;
  tokenActivacion: string;
}

// Datos de la activación: se crea el User (rol Propietario) con esta contraseña
// ya cifrada y el propietario pasa a `activo`.
export interface ActivarPropietarioData {
  tokenActivacion: string;
  passwordHash: string;
}

// Coincidencias de unicidad encontradas entre los propietarios existentes.
export interface PropietarioDuplicados {
  email: boolean;
  telefono: boolean;
  identificacion: boolean;
}

/** Puerto: persistencia de propietarios. */
export interface PropietarioRepository {
  create(data: CreatePropietarioData): Promise<Propietario>;
  findMany(
    params: ListPropietariosParams
  ): Promise<PaginatedResult<Propietario>>;

  /**
   * Indica si el email, teléfono o documento ya pertenecen a otro propietario.
   * Cada bandera es independiente para poder construir un mensaje preciso.
   */
  buscarDuplicados(datos: {
    email: string;
    telefono?: string | null;
    identificacion?: string | null;
  }): Promise<PropietarioDuplicados>;

  /** Registro público: crea Persona + Propietario `pendiente` con su token. */
  registrar(data: RegistrarPropietarioData): Promise<Propietario>;

  /** Busca un propietario por su token de activación (null si no existe). */
  findByTokenActivacion(token: string): Promise<Propietario | null>;

  /**
   * Activa la cuenta en una transacción: crea el User (rol Propietario), lo
   * enlaza a la persona y al propietario, marca `activo` y limpia el token.
   */
  activar(data: ActivarPropietarioData): Promise<Propietario>;
}
