import { ImageStorage } from "../../domain/ports/ImageStorage";
import {
  NovedadRaw,
  NovedadRepository,
} from "../../domain/ports/NovedadRepository";
import {
  CreateNovedadInput,
  NovedadImagen,
  NovedadResponse,
} from "../dtos/NovedadDtos";

/**
 * Crea una novedad (reporte de avance) de una parcela. Sube primero las
 * imágenes a S3 y luego registra la novedad con su detalle. Es el caso de uso
 * que se reutiliza al crear una parcela (para su primera novedad).
 */
export class CreateNovedadUseCase {
  constructor(
    private readonly novedadRepository: NovedadRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    parcelaId: string,
    input: CreateNovedadInput,
    imagenes: NovedadImagen[]
  ): Promise<NovedadResponse> {
    // Las imágenes son opcionales: se suben primero a S3 y luego se
    // referencian en el detalle de la novedad.
    const imagenIds: string[] = [];
    for (const imagen of imagenes) {
      const stored = await this.imageStorage.upload({
        ...imagen,
        tipo: "novedad",
      });
      imagenIds.push(stored.id);
    }

    const novedad = await this.novedadRepository.create({
      parcelaId,
      etapaId: input.etapaId,
      descripcion: input.descripcion,
      imagenIds,
    });

    return this.toResponse(novedad);
  }

  /** Resuelve los ids de imagen a URLs firmadas para la respuesta. */
  private async toResponse(novedad: NovedadRaw): Promise<NovedadResponse> {
    const imagenes = await Promise.all(
      novedad.imagenes.map((im) =>
        this.imageStorage.getPresignedUrl(im.imagenId)
      )
    );

    return {
      id: novedad.id,
      descripcion: novedad.descripcion,
      fecha: novedad.fecha.toISOString(),
      etapa: novedad.etapa,
      imagenes,
    };
  }
}
