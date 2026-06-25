import { ImagenLocal, PrismaClient } from "@prisma/client";
import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { NotFoundError } from "@shared/errors/AppError";
import {
  DownloadedImage,
  ImageStorageClientPort,
} from "./ImageStorageClientPort";
import { imageStorageClient } from "./HttpImageStorageClient";

export interface UploadImageInput {
  buffer: Buffer;
  mimeType: string;
  /** Categoría libre: 'finca', 'reporte', etc. */
  tipo?: string;
}

/**
 * Servicio compartido para almacenar/recuperar imágenes usando el servicio
 * propio (https://mycoffeefarm.com/api-imagenes). Equivale al antiguo
 * `S3Service` pero persiste la referencia en la tabla `imagenes_locales`:
 * el `id` lo genera el servicio remoto y es la única forma de recuperar la
 * imagen después.
 *
 * Implementa el puerto `ImageStorage` de las features de forma estructural
 * (`upload`/`getPresignedUrl`/`remove`), por lo que reemplaza a `s3Service`
 * sin tocar los casos de uso.
 */
export class LocalImageService {
  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly client: ImageStorageClientPort = imageStorageClient
  ) {}

  /** Sube la imagen al servicio remoto y registra la referencia en BD. */
  async upload({ buffer, mimeType, tipo }: UploadImageInput): Promise<{ id: string }> {
    const stored = await this.client.upload({ buffer, mimeType });

    await this.db.imagenLocal.create({
      data: {
        id: stored.id,
        project: stored.project,
        url: stored.url,
        tipo,
      },
    });

    return { id: stored.id };
  }

  /** Descarga el binario de la imagen a partir de su id. */
  async download(id: string): Promise<DownloadedImage> {
    await this.findOrFail(id);
    return this.client.download(id);
  }

  /**
   * Devuelve la URL pública absoluta de la imagen. Se mantiene el nombre
   * `getPresignedUrl` por compatibilidad con el puerto `ImageStorage`, aunque
   * el servicio remoto no usa URLs firmadas.
   */
  async getPresignedUrl(id: string): Promise<string> {
    return this.client.getPublicUrl(id);
  }

  /**
   * Elimina la referencia en `imagenes_locales`. El servicio remoto no expone
   * borrado (no guarda metadatos), así que el binario permanece allí.
   */
  async remove(id: string): Promise<void> {
    await this.db.imagenLocal.deleteMany({ where: { id } });
  }

  private async findOrFail(id: string): Promise<ImagenLocal> {
    const imagen = await this.db.imagenLocal.findUnique({ where: { id } });
    if (!imagen) {
      throw new NotFoundError("Imagen no encontrada");
    }
    return imagen;
  }
}

/** Instancia compartida lista para consumir desde las features. */
export const localImageService = new LocalImageService();
