import { UploadImagePayload } from "../../domain/ports/ImageStorage";

/** Datos de entrada para registrar una novedad (sin las imágenes). */
export interface RegistrarNovedadInput {
  etapaId?: string | null;
  descripcion?: string | null;
}

/** Imágenes recibidas en el request, listas para subir a S3. */
export type NovedadImagen = UploadImagePayload;

/** Novedad ya resuelta para responder al cliente (URLs firmadas). */
export interface NovedadResponse {
  id: string;
  descripcion: string | null;
  fecha: string;
  etapa: { id: string; nombre: string; orden: number } | null;
  imagenes: string[];
}
