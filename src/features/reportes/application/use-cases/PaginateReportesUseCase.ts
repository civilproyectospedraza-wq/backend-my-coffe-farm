import { PaginatedResult } from "@shared/domain/pagination";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import { ReporteRepository } from "../../domain/ports/ReporteRepository";
import {
  ListReportesInput,
  ReporteListItemResponse,
} from "../dtos/ReporteDtos";

/**
 * Listado paginado de reportes (del más reciente al más antiguo), con
 * filtro opcional por parcela y las URLs de imagen ya resueltas.
 */
export class PaginateReportesUseCase {
  constructor(
    private readonly reporteRepository: ReporteRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    input: ListReportesInput
  ): Promise<PaginatedResult<ReporteListItemResponse>> {
    const result = await this.reporteRepository.findMany(input);

    const data = await Promise.all(
      result.data.map(async (reporte) => ({
        id: reporte.id,
        descripcion: reporte.descripcion,
        fecha: reporte.fecha.toISOString(),
        etapa: reporte.etapa,
        parcela: reporte.parcela,
        imagenes: await Promise.all(
          reporte.imagenes.map((im) =>
            this.imageStorage.getPresignedUrl(im.imagenId)
          )
        ),
      }))
    );

    return { ...result, data };
  }
}
