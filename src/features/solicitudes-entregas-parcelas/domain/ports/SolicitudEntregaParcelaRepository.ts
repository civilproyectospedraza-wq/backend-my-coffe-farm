import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";
import { EstadoSolicitudEntrega } from "../entities/EstadoSolicitudEntrega";
import { SolicitudEntregaParcela } from "../entities/SolicitudEntregaParcela";

export interface CreateSolicitudEntregaParcelaData {
  parcelaId: string;
  cantidadKg: number;
  /** Versión de tarifa vigente al solicitar; null si la parcela no tiene tarifa. */
  tarifaVersionId: string | null;
  /** Estimado de pago al propietario; null si no se pudo calcular. */
  valor: number | null;
}

export interface ListSolicitudesEntregasParcelasParams
  extends PaginationParams {
  parcelaId?: string;
  estado?: EstadoSolicitudEntrega;
  /**
   * Si viene, solo las solicitudes de parcelas de ese propietario. Para un
   * Propietario autenticado el backend lo fuerza a su propio id (scope desde el
   * JWT); para un Administrador queda `undefined` (ve todo).
   */
  propietarioId?: string;
}

/**
 * Solicitud enriquecida para el listado: además del dato crudo trae el nombre
 * de la parcela y la finca, que es lo que la UI necesita mostrar sin pedir
 * cada parcela por separado.
 */
export interface SolicitudEntregaParcelaListItem {
  solicitud: SolicitudEntregaParcela;
  parcelaNombre: string | null;
  fincaNombre: string;
}

/** Filtros del conteo por estado (mismo scope de seguridad que el listado). */
export interface CountSolicitudesEntregasParcelasParams {
  parcelaId?: string;
  /** Si viene, solo cuenta solicitudes de parcelas de ese propietario. */
  propietarioId?: string;
}

/** Cantidad de solicitudes en cada estado de gestión. */
export interface SolicitudesEntregasParcelasConteoPorEstado {
  pendientes: number;
  enGestion: number;
  gestionadas: number;
  canceladas: number;
}

/**
 * Datos de la parcela necesarios para autorizar la solicitud (a qué propietario
 * pertenece) y para armar el correo de aviso a los administrativos.
 */
export interface ParcelaSolicitudContexto {
  parcelaId: string;
  /** Nombre de la versión actual de la parcela; null si aún no tiene versión. */
  parcelaNombre: string | null;
  fincaNombre: string;
  propietarioId: string;
  propietarioNombre: string;
  /**
   * Versión vigente de la tarifa de metraje de la parcela y su valor por kg al
   * propietario. Ambos null si la parcela no tiene tarifa asignada: en ese caso
   * la solicitud se crea igual, pero sin estimado de pago.
   */
  tarifaVersionId: string | null;
  valorPropietarioPorKg: number | null;
}

/** Puerto: persistencia de las solicitudes de entrega de una parcela. */
export interface SolicitudEntregaParcelaRepository {
  create(
    data: CreateSolicitudEntregaParcelaData
  ): Promise<SolicitudEntregaParcela>;

  /** Contexto de la parcela (dueño y nombres). `null` si la parcela no existe. */
  findParcelaContexto(
    parcelaId: string
  ): Promise<ParcelaSolicitudContexto | null>;

  /**
   * Lista paginada de solicitudes (de la más reciente a la más antigua), con
   * filtros opcionales por parcela y estado.
   */
  findMany(
    params: ListSolicitudesEntregasParcelasParams
  ): Promise<PaginatedResult<SolicitudEntregaParcelaListItem>>;

  /** Cuántas solicitudes hay en cada estado de gestión. */
  countByEstado(
    params: CountSolicitudesEntregasParcelasParams
  ): Promise<SolicitudesEntregasParcelasConteoPorEstado>;

  /**
   * Cambia el estado de gestión de una solicitud. Devuelve `null` si la
   * solicitud no existe.
   */
  updateEstado(
    id: string,
    estado: EstadoSolicitudEntrega
  ): Promise<SolicitudEntregaParcela | null>;
}
