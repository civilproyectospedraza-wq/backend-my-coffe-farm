import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";

export interface CreateReporteData {
  parcelaId: string;
  // Cambio de etapa opcional: si viene, también avanza la etapa actual de la parcela.
  etapaId?: string | null;
  descripcion?: string | null;
  // Ids de las imágenes (ImagenLocal) ya subidas (pueden ser ninguna).
  imagenIds: string[];
}

export interface ListReportesParams extends PaginationParams {
  parcelaId?: string;
}

/** Reporte crudo devuelto por el repositorio (con ids de imagen sin resolver). */
export interface ReporteRaw {
  id: string;
  descripcion: string | null;
  fecha: Date;
  etapa: { id: string; nombre: string; orden: number } | null;
  imagenes: Array<{ imagenId: string }>;
}

/** Reporte crudo para el listado paginado (incluye la parcela de origen). */
export interface ReporteListItemRaw extends ReporteRaw {
  parcela: { id: string; nombre: string };
}

/** Puerto: persistencia de reportes (reportes de avance de una parcela). */
export interface ReporteRepository {
  /**
   * Registra un reporte de una parcela. Si trae etapa, además actualiza la
   * etapa actual de la parcela. Devuelve el reporte creado.
   */
  create(data: CreateReporteData): Promise<ReporteRaw>;

  /** Historia de reportes de una parcela, del más reciente al más antiguo. */
  findByParcela(parcelaId: string): Promise<ReporteRaw[]>;

  /**
   * Lista paginada de reportes (del más reciente al más antiguo),
   * con filtro opcional por parcela.
   */
  findMany(
    params: ListReportesParams
  ): Promise<PaginatedResult<ReporteListItemRaw>>;
}
