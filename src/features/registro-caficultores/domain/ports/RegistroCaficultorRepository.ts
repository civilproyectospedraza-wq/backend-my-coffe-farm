import { PaginatedResult, PaginationParams } from "@shared/domain/pagination";
import { TipoIdentificacion } from "@features/propietarios/domain/entities/TipoIdentificacion";
import { EstadoRegistroCaficultor } from "../entities/EstadoRegistroCaficultor";
import { RegistroCaficultor } from "../entities/RegistroCaficultor";

export interface CreateRegistroCaficultorData {
  nombre: string;
  email: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoIdentificacion: TipoIdentificacion;
  identificacion: string;
}

export interface ListRegistrosCaficultorParams extends PaginationParams {
  estado?: EstadoRegistroCaficultor;
  /** Texto de búsqueda sobre nombre, email e identificación. */
  search?: string;
}

// Datos para aprobar una solicitud: se crea el propietario y la solicitud
// pasa a `aprobado`. El hash de la contraseña (número de documento) se calcula
// en la capa de aplicación.
export interface AprobarRegistroData {
  passwordHash: string;
  revisadoPor: string;
}

// Resultado de aprobar: la solicitud actualizada y el id del propietario creado.
export interface AprobarRegistroResult {
  registro: RegistroCaficultor;
  propietarioId: string;
}

export interface RechazarRegistroData {
  motivo: string;
  revisadoPor: string;
}

/** Puerto: persistencia de solicitudes de registro de caficultores. */
export interface RegistroCaficultorRepository {
  /** Crea una solicitud en estado `pendiente`. */
  create(data: CreateRegistroCaficultorData): Promise<RegistroCaficultor>;

  findById(id: string): Promise<RegistroCaficultor | null>;

  findMany(
    params: ListRegistrosCaficultorParams
  ): Promise<PaginatedResult<RegistroCaficultor>>;

  /**
   * Aprueba la solicitud en una única transacción: valida que siga `pendiente`,
   * crea User + Persona + Propietario y marca la solicitud como `aprobado`.
   */
  aprobar(
    id: string,
    data: AprobarRegistroData
  ): Promise<AprobarRegistroResult>;

  /** Marca la solicitud como `rechazado` con el motivo indicado. */
  rechazar(
    id: string,
    data: RechazarRegistroData
  ): Promise<RegistroCaficultor>;
}
