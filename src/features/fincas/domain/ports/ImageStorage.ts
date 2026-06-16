export interface UploadImagePayload {
  buffer: Buffer;
  mimeType: string;
  /** Categoría libre: 'finca', 'foto', etc. */
  tipo?: string;
}

/**
 * Puerto de almacenamiento de imágenes. Lo implementa el `S3Service`
 * compartido; el contrato se mantiene mínimo para no acoplar la capa de
 * aplicación al proveedor (AWS).
 */
export interface ImageStorage {
  upload(input: UploadImagePayload): Promise<{ id: string }>;
  remove(id: string): Promise<void>;
  getPresignedUrl(id: string, expiresInSeconds?: number): Promise<string>;
}
