import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";
import { CorreoAdministrativoNotificacion } from "../entities/CorreoAdministrativoNotificacion";

export interface CreateCorreoAdministrativoNotificacionData {
  correo: string;
  estado?: boolean;
  notificarVentasParcelas: boolean;
  notificarSolicitudesEntregaPropietarios: boolean;
}

export interface UpdateCorreoAdministrativoNotificacionData {
  correo?: string;
  estado?: boolean;
  notificarVentasParcelas?: boolean;
  notificarSolicitudesEntregaPropietarios?: boolean;
}

export interface ListCorreosAdministrativosNotificacionesParams
  extends PaginationParams {
  search?: string;
  estado?: boolean;
  notificarVentasParcelas?: boolean;
  notificarSolicitudesEntregaPropietarios?: boolean;
}

/** Puerto: persistencia de los correos administrativos de notificaciones. */
export interface CorreoAdministrativoNotificacionRepository {
  create(
    data: CreateCorreoAdministrativoNotificacionData
  ): Promise<CorreoAdministrativoNotificacion>;
  update(
    id: string,
    data: UpdateCorreoAdministrativoNotificacionData
  ): Promise<CorreoAdministrativoNotificacion>;
  /** Busca por id, ignorando los borrados lógicamente. */
  findById(id: string): Promise<CorreoAdministrativoNotificacion | null>;
  /**
   * Busca un correo vigente (no borrado lógicamente), sin distinguir
   * mayúsculas. `excludeId` permite ignorar el propio registro al actualizar.
   */
  findByCorreo(
    correo: string,
    excludeId?: string
  ): Promise<CorreoAdministrativoNotificacion | null>;
  findMany(
    params: ListCorreosAdministrativosNotificacionesParams
  ): Promise<PaginatedResult<CorreoAdministrativoNotificacion>>;
}
