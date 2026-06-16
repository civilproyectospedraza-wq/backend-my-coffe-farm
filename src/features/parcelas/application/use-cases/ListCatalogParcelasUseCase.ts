import { PaginatedResult } from "@shared/domain/pagination";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import {
  buildGeolocalizacion,
  CatalogParcela,
  ListCatalogParcelasInput,
} from "../dtos/CatalogDtos";

export class ListCatalogParcelasUseCase {
  constructor(
    private readonly parcelaRepository: ParcelaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    input: ListCatalogParcelasInput
  ): Promise<PaginatedResult<CatalogParcela>> {
    const result = await this.parcelaRepository.findAvailableCatalog(input);

    const data: CatalogParcela[] = await Promise.all(
      result.data.map(async (raw) => ({
        id: raw.id,
        nombre: raw.nombre,
        descripcion: raw.descripcion,
        areaHectareas: raw.areaHectareas,
        precioAlquiler: raw.precioAlquiler,
        geolocalizacion: buildGeolocalizacion(raw.latitud, raw.longitud),
        imagenActual: raw.imagenActualId
          ? await this.imageStorage.getPresignedUrl(raw.imagenActualId)
          : null,
        finca: raw.finca,
        etapaActual: raw.etapaActual,
      }))
    );

    return { ...result, data };
  }
}
