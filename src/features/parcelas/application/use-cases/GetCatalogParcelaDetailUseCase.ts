import { NotFoundError } from "@shared/errors/AppError";
import { ImageStorage } from "../../domain/ports/ImageStorage";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import {
  buildGeolocalizacion,
  CatalogParcelaDetail,
} from "../dtos/CatalogDtos";

export class GetCatalogParcelaDetailUseCase {
  constructor(
    private readonly parcelaRepository: ParcelaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(id: string): Promise<CatalogParcelaDetail> {
    const raw = await this.parcelaRepository.findAvailableDetail(id);

    if (!raw) {
      throw new NotFoundError("Parcela no disponible");
    }

    // Cachea las URLs firmadas para no re-consultar la misma imagen.
    const urlCache = new Map<string, string>();
    const resolveUrl = async (
      imagenId: string | null
    ): Promise<string | null> => {
      if (!imagenId) return null;
      const cached = urlCache.get(imagenId);
      if (cached) return cached;
      const url = await this.imageStorage.getPresignedUrl(imagenId);
      urlCache.set(imagenId, url);
      return url;
    };

    const [imagenActual, fincaImagen] = await Promise.all([
      resolveUrl(raw.imagenActualId),
      resolveUrl(raw.finca.imagenId),
    ]);

    const galeria = await Promise.all(
      raw.galeria.map(async (item) => ({
        url: (await resolveUrl(item.imagenId))!,
        ...(item.titulo ? { titulo: item.titulo } : {}),
        fecha: item.fecha.toISOString(),
      }))
    );

    const historialNovedades = await Promise.all(
      raw.historialNovedades.map(async (nov) => ({
        etapa: nov.etapa,
        fecha: nov.fecha.toISOString(),
        ...(nov.descripcion ? { descripcion: nov.descripcion } : {}),
        imagenes: (
          await Promise.all(nov.imagenes.map((im) => resolveUrl(im.imagenId)))
        )
          .filter((url): url is string => url !== null)
          .map((url) => ({ url })),
      }))
    );

    return {
      id: raw.id,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      areaHectareas: raw.areaHectareas,
      precioAlquiler: raw.precioAlquiler,
      geolocalizacion: buildGeolocalizacion(raw.latitud, raw.longitud),
      imagenActual,
      finca: {
        id: raw.finca.id,
        nombre: raw.finca.nombre,
        ubicacion: raw.finca.ubicacion,
        municipio: raw.finca.municipio,
        departamento: raw.finca.departamento,
        descripcion: raw.finca.descripcion,
        altitudMetros: raw.finca.altitudMetros,
        geolocalizacion: buildGeolocalizacion(
          raw.finca.latitud,
          raw.finca.longitud
        ),
        imagen: fincaImagen,
      },
      etapaActual: raw.etapaActual,
      galeria,
      historialNovedades,
    };
  }
}
