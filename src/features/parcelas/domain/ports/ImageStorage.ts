export interface UploadImagePayload {
  buffer: Buffer;
  mimeType: string;
  /** Categoría libre: 'novedad', 'foto', etc. */
  tipo?: string;
}

/**
 * Puerto de almacenamiento de imágenes. Lo implementa el `S3Service`
 * compartido de forma estructural. Se usa tanto para resolver URLs
 * firmadas del catálogo público como para subir las imágenes de una
 * novedad de parcela.
 */
export interface ImageStorage {
  upload(input: UploadImagePayload): Promise<{ id: string }>;
  remove(id: string): Promise<void>;
  getPresignedUrl(id: string, expiresInSeconds?: number): Promise<string>;
}
