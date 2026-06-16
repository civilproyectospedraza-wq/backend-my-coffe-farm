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
  version: {
    nombre: string;
    descripcion?: string | null;
    areaHectareas?: number | null;
    precioAlquiler: number;
  };
}

export interface UpdateParcelaData {
  estado?: EstadoParcela;
  etapaActualId?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  // Si viene, se genera una nueva versión de la parcela.
  version?: {
    nombre?: string;
    descripcion?: string | null;
    areaHectareas?: number | null;
    precioAlquiler?: number;
  };
}

export interface ListParcelasParams extends PaginationParams {
  fincaId?: string;
  estado?: EstadoParcela;
}

export interface RegistrarNovedadData {
  parcelaId: string;
  // Cambio de etapa opcional: si viene, también avanza la etapa actual.
  etapaId?: string | null;
  descripcion?: string | null;
  // Ids de las imágenes ya subidas a S3 (pueden ser ninguna).
  imagenIds: string[];
}

/** Novedad cruda devuelta por el repositorio (con ids de imagen sin firmar). */
export interface NovedadRaw {
  id: string;
  descripcion: string | null;
  fecha: Date;
  etapa: { id: string; nombre: string; orden: number } | null;
  imagenes: Array<{ imagenId: string }>;
}

/** Puerto: persistencia de parcelas (con versionado). */
export interface ParcelaRepository {
  create(data: CreateParcelaData): Promise<Parcela>;
  update(id: string, data: UpdateParcelaData): Promise<Parcela>;
  findById(id: string): Promise<Parcela | null>;
  findMany(params: ListParcelasParams): Promise<PaginatedResult<Parcela>>;

  /**
   * Catálogo público: parcelas disponibles para la venta. Solo incluye
   * parcelas con estado `disponible`, etapa actual habilitada para venta y
   * sin ninguna suscripción activa.
   */
  findAvailableCatalog(
    params: ListCatalogParcelasInput
  ): Promise<PaginatedResult<CatalogParcelaRaw>>;

  /** Detalle público de una parcela disponible (null si no aplica). */
  findAvailableDetail(id: string): Promise<CatalogParcelaDetailRaw | null>;

  /**
   * Registra una novedad (reporte de avance) de una parcela. Si trae etapa,
   * además actualiza la etapa actual de la parcela. Devuelve la novedad creada.
   */
  registrarNovedad(data: RegistrarNovedadData): Promise<NovedadRaw>;

  /** Historia de novedades de una parcela, de la más reciente a la más antigua. */
  findNovedades(parcelaId: string): Promise<NovedadRaw[]>;
}
