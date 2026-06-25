import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";
import {
  CatalogParcelaDetailRaw,
  CatalogParcelaRaw,
  ListCatalogParcelasInput,
} from "../../application/dtos/CatalogDtos";
import { EstadoParcela } from "../entities/EstadoParcela";
import { Parcela } from "../entities/Parcela";

export interface CreateParcelaData {
  fincaId: string;
  etapaActualId?: string | null;
  estado?: EstadoParcela;
  latitud?: number | null;
  longitud?: number | null;
  // Ids de las imágenes (ImagenLocal) ya subidas para la portada de la
  // parcela. Se persisten en `ImagenParcela`, en el orden recibido.
  imagenLocalIds?: string[];
  version: {
    nombre: string;
    descripcion?: string | null;
    areaMetrosCuadrados?: number | null;
    precioAlquiler: number;
  };
}

export interface UpdateParcelaData {
  estado?: EstadoParcela;
  etapaActualId?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  // Si viene (aunque sea vacío), reemplaza por completo la portada de la
  // parcela (`ImagenParcela`) con estas imágenes, en el orden recibido.
  imagenLocalIds?: string[];
  // Si viene, se genera una nueva versión de la parcela.
  version?: {
    nombre?: string;
    descripcion?: string | null;
    areaMetrosCuadrados?: number | null;
    precioAlquiler?: number;
  };
}

export interface ListParcelasParams extends PaginationParams {
  fincaId?: string;
  estado?: EstadoParcela;
}

/** Puerto: persistencia de parcelas (con versionado). */
export interface ParcelaRepository {
  create(data: CreateParcelaData): Promise<Parcela>;
  update(id: string, data: UpdateParcelaData): Promise<Parcela>;
  findById(id: string): Promise<Parcela | null>;
  findMany(params: ListParcelasParams): Promise<PaginatedResult<Parcela>>;

  /**
   * Catálogo público: parcelas disponibles para la venta. Solo incluye
   * parcelas con estado `disponible` y versión actual (al pagar una venta la
   * parcela pasa a `ocupada` y deja de aparecer).
   */
  findAvailableCatalog(
    params: ListCatalogParcelasInput
  ): Promise<PaginatedResult<CatalogParcelaRaw>>;

  /** Detalle público de una parcela disponible (null si no aplica). */
  findAvailableDetail(id: string): Promise<CatalogParcelaDetailRaw | null>;
}
