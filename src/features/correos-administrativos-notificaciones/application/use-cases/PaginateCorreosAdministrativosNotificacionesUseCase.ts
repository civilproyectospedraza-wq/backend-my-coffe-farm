import { PaginatedResult } from "@shared/domain/pagination";
import { CorreoAdministrativoNotificacion } from "../../domain/entities/CorreoAdministrativoNotificacion";
import { CorreoAdministrativoNotificacionRepository } from "../../domain/ports/CorreoAdministrativoNotificacionRepository";
import { ListCorreosAdministrativosNotificacionesInput } from "../dtos/CorreoAdministrativoNotificacionDtos";

/**
 * Listado paginado de correos administrativos (del más reciente al más
 * antiguo), con filtros opcionales por texto, estado y banderas de
 * notificación. Los borrados lógicamente quedan fuera.
 */
export class PaginateCorreosAdministrativosNotificacionesUseCase {
  constructor(
    private readonly correoRepository: CorreoAdministrativoNotificacionRepository
  ) {}

  execute(
    input: ListCorreosAdministrativosNotificacionesInput
  ): Promise<PaginatedResult<CorreoAdministrativoNotificacion>> {
    return this.correoRepository.findMany(input);
  }
}
