import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";

export interface CreateNovedadData {
  parcelaId: string;
  // Cambio de etapa opcional: si viene, también avanza la etapa actual de la parcela.
  etapaId?: string | null;
  descripcion?: string | null;
  // Ids de las imágenes ya subidas a S3 (pueden ser ninguna).
  imagenIds: string[];
}

export interface ListNovedadesParams extends PaginationParams {
  parcelaId?: string;
}

/** Novedad cruda devuelta por el repositorio (con ids de imagen sin firmar). */
export interface NovedadRaw {
  id: string;
  descripcion: string | null;
  fecha: Date;
  etapa: { id: string; nombre: string; orden: number } | null;
  imagenes: Array<{ imagenId: string }>;
}

/** Novedad cruda para el listado paginado (incluye la parcela de origen). */
export interface NovedadListItemRaw extends NovedadRaw {
  parcela: { id: string; nombre: string };
}

/** Puerto: persistencia de novedades (reportes de avance de una parcela). */
export interface NovedadRepository {
  /**
   * Registra una novedad de una parcela. Si trae etapa, además actualiza la
   * etapa actual de la parcela. Devuelve la novedad creada.
   */
  create(data: CreateNovedadData): Promise<NovedadRaw>;

  /** Historia de novedades de una parcela, de la más reciente a la más antigua. */
  findByParcela(parcelaId: string): Promise<NovedadRaw[]>;

  /**
   * Lista paginada de novedades (de la más reciente a la más antigua),
   * con filtro opcional por parcela.
   */
  findMany(
    params: ListNovedadesParams
  ): Promise<PaginatedResult<NovedadListItemRaw>>;
}
