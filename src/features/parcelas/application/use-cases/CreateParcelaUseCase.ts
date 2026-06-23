import { NovedadImagen } from "@features/novedades/application/dtos/NovedadDtos";
import { CreateNovedadUseCase } from "@features/novedades/application/use-cases/CreateNovedadUseCase";
import { Parcela } from "../../domain/entities/Parcela";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import { CreateParcelaInput } from "../dtos/ParcelaDtos";

/**
 * Crea una parcela con su versión inicial. Si llega contenido de primera
 * novedad (etapa, descripción o imágenes) se reutiliza el caso de uso de crear
 * novedad, que registra el reporte y, si trae etapa, fija la etapa actual.
 */
export class CreateParcelaUseCase {
  constructor(
    private readonly parcelaRepository: ParcelaRepository,
    private readonly createNovedadUseCase: CreateNovedadUseCase
  ) {}

  async execute(
    input: CreateParcelaInput,
    imagenes: NovedadImagen[]
  ): Promise<Parcela> {
    const parcela = await this.parcelaRepository.create({
      fincaId: input.fincaId,
      estado: input.estado,
      latitud: input.latitud,
      longitud: input.longitud,
      version: {
        nombre: input.nombre,
        descripcion: input.descripcion,
        areaHectareas: input.areaHectareas,
        precioAlquiler: input.precioAlquiler,
      },
    });

    // Primera novedad opcional: solo se registra si hay contenido (etapa,
    // descripción o imágenes). Si trae etapa, deja fijada la etapa actual.
    const tieneNovedad =
      Boolean(input.etapaId) ||
      Boolean(input.novedadDescripcion) ||
      imagenes.length > 0;

    if (!tieneNovedad) {
      return parcela;
    }

    await this.createNovedadUseCase.execute(
      parcela.id,
      { etapaId: input.etapaId, descripcion: input.novedadDescripcion },
      imagenes
    );

    // Se relee para devolver la parcela con su etapa actual ya aplicada.
    const refreshed = await this.parcelaRepository.findById(parcela.id);
    return refreshed ?? parcela;
  }
}
