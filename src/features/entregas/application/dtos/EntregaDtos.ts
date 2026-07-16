import { UploadImagePayload } from "../../domain/ports/ImageStorage";

/** Comprobante de pago recibido en el request, listo para subir. */
export type ComprobanteImagen = UploadImagePayload;

/** Datos de entrada para crear una entrega (sin la imagen). */
export interface CreateEntregaInput {
  suscripcionId: string;
  cantidadEntregada: number;
  valorPagado: number;
}

/** Datos de entrada para editar una entrega (todos opcionales). */
export interface UpdateEntregaInput {
  cantidadEntregada?: number;
  valorPagado?: number;
}

/** Entrega ya resuelta para responder al cliente (URL pública del comprobante). */
export interface EntregaResponse {
  id: string;
  suscripcionId: string;
  cantidadEntregada: number;
  valorPagado: number;
  comprobanteUrl: string | null;
  createdAt: string;
}

/** Parámetros para paginar entregas (filtro opcional por suscripción). */
export interface ListEntregasInput {
  page: number;
  limit: number;
  suscripcionId?: string;
  /** Scope de propietario resuelto desde el JWT (undefined = Admin, ve todo). */
  propietarioId?: string;
}
