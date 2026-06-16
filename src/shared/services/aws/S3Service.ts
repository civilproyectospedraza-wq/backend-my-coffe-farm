import { randomUUID } from "crypto";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ImagenAws, PrismaClient } from "@prisma/client";
import { env } from "@shared/config/env";
import { NotFoundError } from "@shared/errors/AppError";
import { prisma } from "@shared/infrastructure/prisma/prismaClient";
import { s3Client } from "./s3Client";

export interface UploadImageInput {
  buffer: Buffer;
  mimeType: string;
  /** Categoría libre: 'foto', 'documento', 'mapa', etc. */
  tipo?: string;
}

export interface DownloadedImage {
  buffer: Buffer;
  contentType?: string;
  imagen: ImagenAws;
}

/**
 * Servicio compartido para almacenar/recuperar archivos en S3.
 * Cada imagen se sube usando como `key` el mismo UUID con el que se
 * registra en la tabla `imagenes_aws`, de modo que id de BD = key en S3.
 *
 * Se consume desde distintas features (reportes, fincas, etc.).
 */
export class S3Service {
  constructor(
    private readonly db: PrismaClient = prisma,
    private readonly bucket: string = env.aws.s3Bucket,
    private readonly region: string = env.aws.region
  ) {}

  /** Sube un archivo a S3 y registra la referencia en `imagenes_aws`. */
  async upload({ buffer, mimeType, tipo }: UploadImageInput): Promise<ImagenAws> {
    const id = randomUUID();
    const key = id; // la imagen se guarda con el uuid de imagenes_aws

    await s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    return this.db.imagenAws.create({
      data: {
        id,
        urlS3: this.buildUrl(key),
        bucket: this.bucket,
        keyS3: key,
        tipo,
      },
    });
  }

  /** Descarga el contenido binario de una imagen a partir de su id. */
  async download(id: string): Promise<DownloadedImage> {
    const imagen = await this.findOrFail(id);

    const result = await s3Client.send(
      new GetObjectCommand({ Bucket: imagen.bucket, Key: imagen.keyS3 })
    );

    if (!result.Body) {
      throw new NotFoundError("El archivo no existe en S3");
    }

    const buffer = Buffer.from(await result.Body.transformToByteArray());

    return { buffer, contentType: result.ContentType, imagen };
  }

  /** Genera una URL temporal y firmada para acceder a la imagen. */
  async getPresignedUrl(id: string, expiresInSeconds = 3600): Promise<string> {
    const imagen = await this.findOrFail(id);

    return getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: imagen.bucket, Key: imagen.keyS3 }),
      { expiresIn: expiresInSeconds }
    );
  }

  /** Elimina el archivo de S3 y su registro en `imagenes_aws`. */
  async remove(id: string): Promise<void> {
    const imagen = await this.findOrFail(id);

    await s3Client.send(
      new DeleteObjectCommand({ Bucket: imagen.bucket, Key: imagen.keyS3 })
    );

    await this.db.imagenAws.delete({ where: { id } });
  }

  private async findOrFail(id: string): Promise<ImagenAws> {
    const imagen = await this.db.imagenAws.findUnique({ where: { id } });
    if (!imagen) {
      throw new NotFoundError("Imagen no encontrada");
    }
    return imagen;
  }

  private buildUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}

/** Instancia compartida lista para consumir desde las features. */
export const s3Service = new S3Service();
