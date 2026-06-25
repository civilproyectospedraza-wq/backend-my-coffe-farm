// DTOs del catálogo público de parcelas disponibles para la venta.
//
// Los repositorios devuelven las variantes `*Raw` (con ids de imagen sin
// resolver); los use cases las transforman en las respuestas públicas,
// firmando cada `imagenId` contra S3.

export interface ListCatalogParcelasInput {
  page: number;
  limit: number;
  fincaId?: string;
}

// ---- Respuestas públicas ----

export interface Geolocalizacion {
  latitud: number;
  longitud: number;
}

/** Agrupa lat/lng en un objeto; null si falta cualquiera de las dos. */
export function buildGeolocalizacion(
  latitud: number | null,
  longitud: number | null
): Geolocalizacion | null {
  return latitud !== null && longitud !== null
    ? { latitud, longitud }
    : null;
}

export interface CatalogParcela {
  id: string;
  nombre: string;
  descripcion: string | null;
  areaMetrosCuadrados: number | null;
  precioAlquiler: number;
  geolocalizacion: Geolocalizacion | null;
  imagenes: string[];
  finca: { id: string; nombre: string; ubicacion: string };
  etapaActual: { nombre: string; orden: number } | null;
}

export interface CatalogGaleriaItem {
  url: string;
  titulo?: string;
  fecha?: string;
}

export interface CatalogHistorialReporte {
  // La etapa es opcional: un reporte puede no implicar cambio de etapa.
  etapa: { nombre: string; orden: number } | null;
  fecha: string;
  descripcion?: string;
  imagenes: Array<{ url: string }>;
}

export interface CatalogParcelaDetail {
  id: string;
  nombre: string;
  descripcion: string | null;
  areaMetrosCuadrados: number | null;
  precioAlquiler: number;
  geolocalizacion: Geolocalizacion | null;
  finca: {
    id: string;
    nombre: string;
    ubicacion: string;
    municipio: string;
    departamento: string;
    descripcion: string | null;
    altitudMetros: number | null;
    geolocalizacion: Geolocalizacion | null;
    imagen: string | null;
  };
  etapaActual: { nombre: string; orden: number } | null;
  galeria: CatalogGaleriaItem[];
  historialReportes: CatalogHistorialReporte[];
}

// ---- Variantes crudas (devueltas por el repositorio) ----

export interface CatalogParcelaRaw {
  id: string;
  nombre: string;
  descripcion: string | null;
  areaMetrosCuadrados: number | null;
  precioAlquiler: number;
  latitud: number | null;
  longitud: number | null;
  imagenesIds: string[];
  finca: { id: string; nombre: string; ubicacion: string };
  etapaActual: { nombre: string; orden: number } | null;
}

export interface CatalogParcelaDetailRaw {
  id: string;
  nombre: string;
  descripcion: string | null;
  areaMetrosCuadrados: number | null;
  precioAlquiler: number;
  latitud: number | null;
  longitud: number | null;
  finca: {
    id: string;
    nombre: string;
    ubicacion: string;
    municipio: string;
    departamento: string;
    descripcion: string | null;
    altitudMetros: number | null;
    latitud: number | null;
    longitud: number | null;
    imagenId: string | null;
  };
  etapaActual: { nombre: string; orden: number } | null;
  galeria: Array<{ imagenId: string; titulo: string | null; fecha: Date }>;
  historialReportes: Array<{
    etapa: { nombre: string; orden: number } | null;
    fecha: Date;
    descripcion: string | null;
    imagenes: Array<{ imagenId: string }>;
  }>;
}
