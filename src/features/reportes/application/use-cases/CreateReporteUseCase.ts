import { ImageStorage } from "../../domain/ports/ImageStorage";
import {
  ReporteRaw,
  ReporteRepository,
} from "../../domain/ports/ReporteRepository";
import {
  CreateReporteInput,
  ReporteImagen,
  ReporteResponse,
} from "../dtos/ReporteDtos";

/**
 * Crea un reporte (reporte de avance) de una parcela. Sube primero las
 * imágenes y luego registra el reporte con sus imágenes. Es el caso de uso
 * que se reutiliza al crear una parcela (para su primer reporte).
 */
export class CreateReporteUseCase {
  constructor(
    private readonly reporteRepository: ReporteRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    parcelaId: string,
    input: CreateReporteInput,
    imagenes: ReporteImagen[]
  ): Promise<ReporteResponse> {
    // Las imágenes son opcionales: se suben primero y luego se referencian
    // en el reporte.
    const imagenIds: string[] = [];
    for (const imagen of imagenes) {
      const stored = await this.imageStorage.upload({
        ...imagen,
        tipo: "reporte",
      });
      imagenIds.push(stored.id);
    }

    const reporte = await this.reporteRepository.create({
      parcelaId,
      etapaId: input.etapaId,
      descripcion: input.descripcion,
      imagenIds,
    });

    return this.toResponse(reporte);
  }

  /** Resuelve los ids de imagen a URLs públicas para la respuesta. */
  private async toResponse(reporte: ReporteRaw): Promise<ReporteResponse> {
    const imagenes = await Promise.all(
      reporte.imagenes.map((im) =>
        this.imageStorage.getPresignedUrl(im.imagenId)
      )
    );

    return {
      id: reporte.id,
      descripcion: reporte.descripcion,
      fecha: reporte.fecha.toISOString(),
      etapa: reporte.etapa,
      imagenes,
    };
  }
}
