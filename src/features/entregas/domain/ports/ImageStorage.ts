export interface UploadImagePayload {
  buffer: Buffer;
  mimeType: string;
  /** Categoría libre: 'comprobante-entrega', etc. */
  tipo?: string;
}

/**
 * Puerto de almacenamiento de imágenes. Lo implementa el `LocalImageService`
 * compartido de forma estructural. Se usa para subir el comprobante de pago de
 * una entrega y para resolver su URL pública.
 */
export interface ImageStorage {
  upload(input: UploadImagePayload): Promise<{ id: string }>;
  remove(id: string): Promise<void>;
  getPresignedUrl(id: string, expiresInSeconds?: number): Promise<string>;
}
