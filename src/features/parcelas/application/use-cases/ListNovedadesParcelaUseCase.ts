import { ImageStorage } from "../../domain/ports/ImageStorage";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import { NovedadResponse } from "../dtos/NovedadDtos";

/**
 * Historia de novedades de una parcela (de la más reciente a la más antigua),
 * con las URLs de imagen ya firmadas. Es la vista de "últimos reportes".
 */
export class ListNovedadesParcelaUseCase {
  constructor(
    private readonly parcelaRepository: ParcelaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(parcelaId: string): Promise<NovedadResponse[]> {
    const novedades = await this.parcelaRepository.findNovedades(parcelaId);

    return Promise.all(
      novedades.map(async (novedad) => ({
        id: novedad.id,
        descripcion: novedad.descripcion,
        fecha: novedad.fecha.toISOString(),
        etapa: novedad.etapa,
        imagenes: await Promise.all(
          novedad.imagenes.map((im) =>
            this.imageStorage.getPresignedUrl(im.imagenId)
          )
        ),
      }))
    );
  }
}
