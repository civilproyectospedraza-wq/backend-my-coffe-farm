import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";

export interface CreateEntregaData {
  suscripcionId: string;
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
  suscripcionId?: string;
  /**
   * Si viene, solo las entregas de suscripciones de parcelas de ese propietario.
   * Para un Propietario autenticado el backend lo fuerza a su propio id (scope
   * desde el JWT); para un Administrador queda `undefined` (ve todo).
   */
  propietarioId?: string;
}

/** Entrega cruda devuelta por el repositorio (con id de imagen sin resolver). */
export interface EntregaRaw {
  id: string;
  cantidadEntregada: number;
  valorPagado: number;
  imagenComprobanteId: string | null;
  suscripcionId: string;
  createdAt: Date;
}

/** Puerto: persistencia de entregas de una suscripción de parcela. */
export interface EntregaRepository {
  create(data: CreateEntregaData): Promise<EntregaRaw>;

  findById(id: string): Promise<EntregaRaw | null>;

  update(id: string, data: UpdateEntregaData): Promise<EntregaRaw>;

  /**
   * Lista paginada de entregas (de la más reciente a la más antigua), con
   * filtro opcional por suscripción.
   */
  findMany(
    params: ListEntregasParams
  ): Promise<PaginatedResult<EntregaRaw>>;
}
