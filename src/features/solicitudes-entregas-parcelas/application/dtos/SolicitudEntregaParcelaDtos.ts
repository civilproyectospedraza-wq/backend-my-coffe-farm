import { EstadoSolicitudEntrega } from "../../domain/entities/EstadoSolicitudEntrega";

/** Datos de entrada para crear una solicitud de entrega. */
export interface CreateSolicitudEntregaParcelaInput {
  parcelaId: string;
  cantidadKg: number;
  /**
   * Propietario dueño de la solicitud, resuelto desde el JWT. Solo puede pedir
   * entregas sobre parcelas de sus propias fincas.
   */
  propietarioId: string;
}

/** Solicitud ya creada, lista para responder al cliente. */
export interface SolicitudEntregaParcelaResponse {
  id: string;
  parcelaId: string;
  cantidadKg: number;
  /**
   * Versión de tarifa con la que se le pagará al propietario, congelada al
   * crear la solicitud. `null` si la parcela no tenía tarifa asignada.
   */
  tarifaVersionId: string | null;
  /** Estimado de pago (cantidadKg × valor por kg). `null` si no hay tarifa. */
  valor: number | null;
  estado: EstadoSolicitudEntrega;
  createdAt: string;
}

/**
 * Item del listado: la solicitud más el nombre de su parcela y finca, para que
 * la tabla no tenga que resolverlos con una petición por fila.
 */
export interface SolicitudEntregaParcelaListItemResponse
  extends SolicitudEntregaParcelaResponse {
  parcelaNombre: string | null;
  fincaNombre: string;
}

/** Parámetros para paginar solicitudes (filtros opcionales). */
export interface ListSolicitudesEntregasParcelasInput {
  page: number;
  limit: number;
  parcelaId?: string;
  estado?: EstadoSolicitudEntrega;
  /** Scope de propietario resuelto desde el JWT (undefined = Admin, ve todo). */
  propietarioId?: string;
}

/** Parámetros del resumen de solicitudes (mismos filtros que el listado, sin paginación). */
export interface ResumenSolicitudesEntregasParcelasInput {
  parcelaId?: string;
  /**
   * Propietario ya resuelto por el controlador: el del JWT si quien pide es un
   * Propietario, o el `?propietarioId=` del query si es un Administrador
   * (undefined = Admin sin filtro, cuenta todo).
   */
  propietarioId?: string;
}

/** Conteo de solicitudes por estado de gestión. */
export interface ResumenSolicitudesEntregasParcelasResponse {
  pendientes: number;
  enGestion: number;
  gestionadas: number;
  canceladas: number;
  total: number;
}

/** Datos de entrada para cambiar el estado de gestión de una solicitud. */
export interface UpdateEstadoSolicitudEntregaParcelaInput {
  id: string;
  estado: EstadoSolicitudEntrega;
}
