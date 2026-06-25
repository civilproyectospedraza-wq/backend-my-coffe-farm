import { UploadImagePayload } from "../../domain/ports/ImageStorage";

/** Datos de entrada para crear un reporte (sin las imágenes). */
export interface CreateReporteInput {
  etapaId?: string | null;
  descripcion?: string | null;
}

/** Imágenes recibidas en el request, listas para subir. */
export type ReporteImagen = UploadImagePayload;

/** Reporte ya resuelto para responder al cliente (URLs públicas). */
export interface ReporteResponse {
  id: string;
  descripcion: string | null;
  fecha: string;
  etapa: { id: string; nombre: string; orden: number } | null;
  imagenes: string[];
}

/** Parámetros para paginar reportes (filtro opcional por parcela). */
export interface ListReportesInput {
  page: number;
  limit: number;
  parcelaId?: string;
}

/** Reporte paginado: incluye a qué parcela pertenece. */
export interface ReporteListItemResponse extends ReporteResponse {
  parcela: { id: string; nombre: string };
}
