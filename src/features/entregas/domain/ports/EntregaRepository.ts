import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";

export interface CreateEntregaData {
  // Toda entrega responde a una solicitud pendiente. La parcela NO se recibe:
  // se deriva de la solicitud, para que no puedan discrepar.
  solicitudId: string;
  // Opcional: anota a qué contrato se imputó la entrega. La parcela produce y
  // entrega esté alquilada o no.
  suscripcionId?: string | null;
  cantidadEntregada: number;
  valorPagado: number;
  // Id de la imagen (ImagenLocal) del comprobante de pago, ya subida. Opcional.
  imagenComprobanteId?: string | null;
}

export interface UpdateEntregaData {
  cantidadEntregada?: number;
  valorPagado?: number;
  // Solo se toca cuando llega una nueva imagen (se reasigna el comprobante).
  imagenComprobanteId?: string | null;
}

export interface ListEntregasParams extends PaginationParams {
  parcelaId?: string;
  suscripcionId?: string;
  solicitudId?: string;
  /**
   * Si viene, solo las entregas de parcelas de ese propietario. Para un
   * Propietario autenticado el backend lo fuerza a su propio id (scope desde el
   * JWT); para un Administrador queda `undefined` (ve todo).
   */
  propietarioId?: string;
}

/** Entrega cruda devuelta por el repositorio (con id de imagen sin resolver). */
export interface EntregaRaw {
  id: string;
  parcelaId: string;
  cantidadEntregada: number;
  valorPagado: number;
  imagenComprobanteId: string | null;
  suscripcionId: string | null;
  solicitudId: string | null;
  createdAt: Date;
}

/** Puerto: persistencia de entregas de una parcela. */
export interface EntregaRepository {
  /**
   * Registra la entrega y cierra su solicitud (pasa a `gestionada`) en una sola
   * transacción: una solicitud admite exactamente una entrega.
   */
  create(data: CreateEntregaData): Promise<EntregaRaw>;

  findById(id: string): Promise<EntregaRaw | null>;

  update(id: string, data: UpdateEntregaData): Promise<EntregaRaw>;

  /**
   * Lista paginada de entregas (de la más reciente a la más antigua), con
   * filtros opcionales por parcela, suscripción o solicitud.
   */
  findMany(
    params: ListEntregasParams
  ): Promise<PaginatedResult<EntregaRaw>>;
}
