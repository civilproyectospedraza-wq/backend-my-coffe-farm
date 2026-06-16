import { EstadoParcela } from "./EstadoParcela";

export interface ParcelaVersion {
  id: string;
  numeroVersion: number;
  nombre: string;
  descripcion: string | null;
  areaHectareas: number | null;
  precioAlquiler: number;
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

export interface ParcelaProps {
  id: string;
  fincaId: string;
  estado: EstadoParcela;
  latitud: number | null;
  longitud: number | null;
  etapaActualId: string | null;
  versionActualId: string | null;
  createdAt: Date;
  finca: ParcelaFinca;
  etapaActual: ParcelaEtapa | null;
  versionActual: ParcelaVersion | null;
}

export class Parcela {
  readonly id: string;
  readonly fincaId: string;
  readonly estado: EstadoParcela;
  readonly latitud: number | null;
  readonly longitud: number | null;
  readonly etapaActualId: string | null;
  readonly versionActualId: string | null;
  readonly createdAt: Date;
  readonly finca: ParcelaFinca;
  readonly etapaActual: ParcelaEtapa | null;
  readonly versionActual: ParcelaVersion | null;

  constructor(props: ParcelaProps) {
    this.id = props.id;
    this.fincaId = props.fincaId;
    this.estado = props.estado;
    this.latitud = props.latitud;
    this.longitud = props.longitud;
    this.etapaActualId = props.etapaActualId;
    this.versionActualId = props.versionActualId;
    this.createdAt = props.createdAt;
    this.finca = props.finca;
    this.etapaActual = props.etapaActual;
    this.versionActual = props.versionActual;
  }
}
