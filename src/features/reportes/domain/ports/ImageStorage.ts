export interface UploadImagePayload {
  buffer: Buffer;
  mimeType: string;
  /** Categoría libre: 'reporte', 'foto', etc. */
  tipo?: string;
}

/**
 * Puerto de almacenamiento de imágenes. Lo implementa el `LocalImageService`
 * compartido de forma estructural. Se usa para subir las imágenes de un
 * reporte y para resolver sus URLs públicas.
 */
export interface ImageStorage {
  upload(input: UploadImagePayload): Promise<{ id: string }>;
  remove(id: string): Promise<void>;
  getPresignedUrl(id: string, expiresInSeconds?: number): Promise<string>;
}
