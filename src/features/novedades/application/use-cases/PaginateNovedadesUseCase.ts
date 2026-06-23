import { PaginatedResult } from "@shared/domain/pagination";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import { NovedadRepository } from "../../domain/ports/NovedadRepository";
import {
  ListNovedadesInput,
  NovedadListItemResponse,
} from "../dtos/NovedadDtos";

/**
 * Listado paginado de novedades (de la más reciente a la más antigua), con
 * filtro opcional por parcela y las URLs de imagen ya firmadas.
 */
export class PaginateNovedadesUseCase {
  constructor(
    private readonly novedadRepository: NovedadRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    input: ListNovedadesInput
  ): Promise<PaginatedResult<NovedadListItemResponse>> {
    const result = await this.novedadRepository.findMany(input);

    const data = await Promise.all(
      result.data.map(async (novedad) => ({
        id: novedad.id,
        descripcion: novedad.descripcion,
        fecha: novedad.fecha.toISOString(),
        etapa: novedad.etapa,
        parcela: novedad.parcela,
        imagenes: await Promise.all(
          novedad.imagenes.map((im) =>
            this.imageStorage.getPresignedUrl(im.imagenId)
          )
        ),
      }))
    );

    return { ...result, data };
  }
}
