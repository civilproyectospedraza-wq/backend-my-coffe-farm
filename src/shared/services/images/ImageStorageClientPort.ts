/**
 * Puerto (hexagonal) del cliente del servicio externo de almacenamiento de
 * imágenes (https://mycoffeefarm.com/api-imagenes). Aísla a la capa de
 * aplicación del detalle HTTP: cómo se sube, cómo se construye la URL pública
 * y cómo se descarga el binario.
 *
 * El servicio NO guarda metadatos: lo único que persiste mi BD es el `id`
 * (o la `url`) que devuelve la subida, y es la única forma de recuperar la
 * imagen después.
 */

/** Formatos aceptados por el servicio remoto. */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

/** Tamaño máximo permitido por el servicio remoto: 5 MB. */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export interface UploadImageInput {
  /** Contenido binario de la imagen (p. ej. `req.file.buffer` de multer). */
  buffer: Buffer;
  /** MIME real del archivo: 'image/png', 'image/jpeg', 'image/webp'. */
  mimeType: string;
  /** Nombre de archivo opcional para el multipart (solo informativo). */
  filename?: string;
}

/** Respuesta tipada del endpoint de subida (HTTP 201). */
export interface UploadImageResponse {
  /** UUID generado por el servicio. Es lo que debo persistir en mi BD. */
  id: string;
  /** Nombre del proyecto/bucket en el servicio remoto. */
  project: string;
  /** Ruta relativa devuelta, p. ej. `/api-imagenes/projects/.../images/:id`. */
  url: string;
}

/** Imagen descargada (binario + tipo de contenido). */
export interface DownloadedImage {
  buffer: Buffer;
  contentType: string;
}

export interface ImageStorageClientPort {
  /**
   * Sube una imagen al servicio remoto. Valida formato/tamaño antes de
   * enviar para fallar rápido. Devuelve el `id`/`url` a persistir.
   */
  upload(input: UploadImageInput): Promise<UploadImageResponse>;

  /**
   * Construye la URL pública absoluta para mostrar la imagen en el front a
   * partir del `id` persistido. Es una operación local (no hace red).
   */
  getPublicUrl(id: string): string;

  /** Descarga el binario de la imagen a partir de su `id` (proxy/back). */
  download(id: string): Promise<DownloadedImage>;
}
