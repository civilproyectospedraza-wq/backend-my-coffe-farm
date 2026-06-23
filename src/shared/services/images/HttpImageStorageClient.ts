import { AppError, BadRequestError, NotFoundError } from "@shared/errors/AppError";
import { env } from "@shared/config/env";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  DownloadedImage,
  ImageStorageClientPort,
  MAX_IMAGE_SIZE_BYTES,
  UploadImageInput,
  UploadImageResponse,
} from "./ImageStorageClientPort";

interface HttpImageStorageClientOptions {
  /** Base URL del servicio, p. ej. https://mycoffeefarm.com/api-imagenes */
  apiUrl?: string;
  /** Proyecto que actúa como bucket en el servicio remoto. */
  project?: string;
  /** Reintentos ante errores 5xx (además del intento inicial). */
  maxRetries?: number;
}

/**
 * Adaptador HTTP del servicio externo de imágenes. Usa `fetch` y `FormData`
 * nativos (Node 18+): NO se fija manualmente el header `Content-Type`, para
 * que el cliente ponga el `boundary` del multipart automáticamente.
 *
 * Implementa estructuralmente el puerto `ImageStorage` de las features
 * (`upload`/`getPresignedUrl`/`remove`), por lo que puede reemplazar a
 * `s3Service` sin tocar los casos de uso.
 */
export class HttpImageStorageClient implements ImageStorageClientPort {
  private readonly apiUrl: string;
  private readonly project: string;
  private readonly maxRetries: number;

  constructor(options: HttpImageStorageClientOptions = {}) {
    // Sin barra final, para componer rutas de forma predecible.
    this.apiUrl = (options.apiUrl ?? env.images.apiUrl).replace(/\/+$/, "");
    this.project = options.project ?? env.images.project;
    this.maxRetries = options.maxRetries ?? 2;
  }

  async upload({
    buffer,
    mimeType,
    filename,
  }: UploadImageInput): Promise<UploadImageResponse> {
    this.assertValidImage(buffer, mimeType);

    const form = new FormData();
    form.append(
      "image",
      new Blob([new Uint8Array(buffer)], { type: mimeType }),
      filename ?? `image.${this.extensionFor(mimeType)}`
    );

    const endpoint = `${this.apiUrl}/projects/${encodeURIComponent(
      this.project
    )}/images`;

    // NO se fija Content-Type: fetch añade el boundary del multipart.
    const response = await this.requestWithRetry(endpoint, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw await this.toUploadError(response, endpoint);
    }

    const data = (await response.json()) as UploadImageResponse;
    return data;
  }

  getPublicUrl(id: string): string {
    return `${this.apiUrl}/projects/${encodeURIComponent(
      this.project
    )}/images/${encodeURIComponent(id)}`;
  }

  async download(id: string): Promise<DownloadedImage> {
    const response = await this.requestWithRetry(this.getPublicUrl(id), {
      method: "GET",
    });

    if (response.status === 404) {
      throw new NotFoundError("Imagen no encontrada");
    }
    if (!response.ok) {
      throw new AppError(
        `Error al consultar la imagen (HTTP ${response.status})`,
        502
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType:
        response.headers.get("content-type") ?? "application/octet-stream",
    };
  }

  // ---------------------------------------------------------------------------
  // Compatibilidad estructural con el puerto `ImageStorage` de las features.
  // Permite inyectar este cliente donde antes se usaba `s3Service`.
  // ---------------------------------------------------------------------------

  /** Alias de `getPublicUrl`: el servicio remoto no usa URLs firmadas. */
  async getPresignedUrl(id: string): Promise<string> {
    return this.getPublicUrl(id);
  }

  /**
   * El servicio remoto no expone borrado (no guarda metadatos). Se deja como
   * no-op para mantener el contrato; eliminar la referencia en la BD propia
   * es responsabilidad de cada feature.
   */
  async remove(_id: string): Promise<void> {
    // Sin endpoint de borrado en el servicio de imágenes.
  }

  // ---------------------------------------------------------------------------

  /** Valida formato y tamaño antes de salir a la red (falla rápido). */
  private assertValidImage(buffer: Buffer, mimeType: string): void {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestError("La imagen está vacía o no se recibió");
    }
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as never)) {
      throw new AppError(
        `Formato no soportado: ${mimeType}. Permitidos: jpg, jpeg, png, webp`,
        415
      );
    }
    if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
      throw new AppError("La imagen supera el tamaño máximo de 5 MB", 413);
    }
  }

  /** Realiza la petición reintentando solo ante errores 5xx. */
  private async requestWithRetry(
    url: string,
    init: RequestInit
  ): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, init);
        // Reintentar únicamente ante errores del servidor.
        if (response.status >= 500 && attempt < this.maxRetries) {
          console.warn(
            `[images] ${init.method} ${url} -> ${response.status}, reintentando (${
              attempt + 1
            }/${this.maxRetries})`
          );
          await this.delay(200 * (attempt + 1));
          continue;
        }
        return response;
      } catch (error) {
        // Error de red/conexión: reintentar mientras queden intentos.
        lastError = error;
        if (attempt < this.maxRetries) {
          await this.delay(200 * (attempt + 1));
          continue;
        }
      }
    }

    console.error(`[images] Falló la petición a ${url}`, lastError);
    throw new AppError("El servicio de imágenes no está disponible", 502);
  }

  /** Mapea los códigos de error de la subida a errores de la app. */
  private async toUploadError(
    response: Response,
    endpoint: string
  ): Promise<AppError> {
    const detail = await response.text().catch(() => "");
    // Se registra siempre el endpoint + cuerpo crudo para depurar contra el
    // servicio de imágenes (qué URL se llamó y qué respondió).
    console.error(
      `[images] POST ${endpoint} -> ${response.status}. Respuesta: ${
        detail || "(sin cuerpo)"
      }`
    );
    switch (response.status) {
      case 400:
        return new BadRequestError(
          detail || "Falta el campo 'image' o la imagen está vacía"
        );
      case 404:
        // El servicio existe pero la ruta/proyecto no: casi siempre el
        // proyecto (IMAGES_PROJECT) no está creado o IMAGES_API_URL apunta mal.
        return new AppError(
          `El servicio de imágenes respondió 404 en ${endpoint}. ` +
            `Verifica que el proyecto '${this.project}' exista y que ` +
            `IMAGES_API_URL sea correcto.${detail ? ` Detalle: ${detail}` : ""}`,
          502
        );
      case 413:
        return new AppError("La imagen supera el tamaño máximo de 5 MB", 413);
      case 415:
        return new AppError("Formato de imagen no soportado", 415);
      default:
        return new AppError(
          `Error al subir la imagen (HTTP ${response.status}) en ${endpoint}.${
            detail ? ` Detalle: ${detail}` : ""
          }`,
          response.status >= 500 ? 502 : response.status
        );
    }
  }

  private extensionFor(mimeType: string): string {
    return mimeType === "image/jpeg" ? "jpg" : mimeType.replace("image/", "");
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** Instancia compartida lista para inyectar en las features. */
export const imageStorageClient = new HttpImageStorageClient();
