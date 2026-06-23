export interface UploadImagePayload {
  buffer: Buffer;
  mimeType: string;
  /** Categoría libre: 'novedad', 'foto', etc. */
  tipo?: string;
}

/**
 * Puerto de almacenamiento de imágenes. Lo implementa el `S3Service`
 * compartido de forma estructural. Se usa para subir las imágenes de una
 * novedad y para resolver sus URLs firmadas.
 */
export interface ImageStorage {
  upload(input: UploadImagePayload): Promise<{ id: string }>;
  remove(id: string): Promise<void>;
  getPresignedUrl(id: string, expiresInSeconds?: number): Promise<string>;
}
