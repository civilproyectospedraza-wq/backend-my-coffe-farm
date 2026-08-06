import { EstadoParcela } from "./EstadoParcela";

export interface ParcelaVersion {
  id: string;
  numeroVersion: number;
  nombre: string;
  descripcion: string | null;
  tarifaMetrajeId: string | null;
  // Metraje derivado de la tarifa de metraje vinculada (medidaMetrosCuadrados).
  areaMetrosCuadrados: number | null;
  precioVentaPublico: number;
  precioCafetero: number;
}

export interface ParcelaEtapa {
  id: string;
  nombre: string;
  habilitadaVenta: boolean;
  orden: number;
}

export interface ParcelaFinca {
  id: string;
  nombre: string;
}

// Imagen fija de portada de la parcela, referenciada por su ImagenLocal.
export interface ParcelaImagen {
  imagenLocalId: string;
  orden: number;
}

export interface ParcelaProps {
  id: string;
  fincaId: string;
  estado: EstadoParcela;
  latitud: number | null;
  longitud: number | null;
  etapaActualId: string | null;
  versionActualId: string | null;
  // Cuántas veces al año cosecha la parcela (1 a 12).
  temporalidadCosecha: number | null;
  createdAt: Date;
  finca: ParcelaFinca;
  etapaActual: ParcelaEtapa | null;
  versionActual: ParcelaVersion | null;
  // Galería de portada, en orden.
  imagenes: ParcelaImagen[];
  // Meses de cosecha (1 = enero … 12 = diciembre), ascendente. Su cantidad
  // coincide con `temporalidadCosecha`.
  mesesCosecha: number[];
}

export class Parcela {
  readonly id: string;
  readonly fincaId: string;
  readonly estado: EstadoParcela;
  readonly latitud: number | null;
  readonly longitud: number | null;
  readonly etapaActualId: string | null;
  readonly versionActualId: string | null;
  readonly temporalidadCosecha: number | null;
  readonly createdAt: Date;
  readonly finca: ParcelaFinca;
  readonly etapaActual: ParcelaEtapa | null;
  readonly versionActual: ParcelaVersion | null;
  readonly imagenes: ParcelaImagen[];
  readonly mesesCosecha: number[];

  constructor(props: ParcelaProps) {
    this.id = props.id;
    this.fincaId = props.fincaId;
    this.estado = props.estado;
    this.latitud = props.latitud;
    this.longitud = props.longitud;
    this.etapaActualId = props.etapaActualId;
    this.versionActualId = props.versionActualId;
    this.temporalidadCosecha = props.temporalidadCosecha;
    this.createdAt = props.createdAt;
    this.finca = props.finca;
    this.etapaActual = props.etapaActual;
    this.versionActual = props.versionActual;
    this.imagenes = props.imagenes;
    this.mesesCosecha = props.mesesCosecha;
  }
}
