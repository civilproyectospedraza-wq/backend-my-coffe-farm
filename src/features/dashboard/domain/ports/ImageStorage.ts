/**
 * Puerto mínimo de almacenamiento de imágenes para resolver la URL pública del
 * comprobante de una entrega. Lo implementa el `LocalImageService` compartido
 * de forma estructural.
 */
export interface ImageStorage {
  getPresignedUrl(id: string, expiresInSeconds?: number): Promise<string>;
}
