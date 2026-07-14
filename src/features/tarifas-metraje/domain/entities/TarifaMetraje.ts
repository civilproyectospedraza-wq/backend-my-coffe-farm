export interface TarifaMetrajeVersionProps {
  id: string;
  tarifaMedidaId: string;
  valorVenta: number;
  valorPropietario: number;
  produccionKg: number;
  createdAt: Date;
  createdBy: string | null;
}

export class TarifaMetrajeVersion {
  readonly id: string;
  readonly tarifaMedidaId: string;
  readonly valorVenta: number;
  readonly valorPropietario: number;
  readonly produccionKg: number;
  readonly createdAt: Date;
  readonly createdBy: string | null;

  constructor(props: TarifaMetrajeVersionProps) {
    this.id = props.id;
    this.tarifaMedidaId = props.tarifaMedidaId;
    this.valorVenta = props.valorVenta;
    this.valorPropietario = props.valorPropietario;
    this.produccionKg = props.produccionKg;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
  }
}

export interface TarifaMetrajeProps {
  id: string;
  medidaMetrosCuadrados: number;
  versionId: string | null;
  valorVentaActual: number | null;
  valorPropietarioActual: number | null;
  produccionKgActual: number | null;
  createdAt: Date;
  createdBy: string | null;
}

export class TarifaMetraje {
  readonly id: string;
  readonly medidaMetrosCuadrados: number;
  readonly versionId: string | null;
  readonly valorVentaActual: number | null;
  readonly valorPropietarioActual: number | null;
  readonly produccionKgActual: number | null;
  readonly createdAt: Date;
  readonly createdBy: string | null;

  constructor(props: TarifaMetrajeProps) {
    this.id = props.id;
    this.medidaMetrosCuadrados = props.medidaMetrosCuadrados;
    this.versionId = props.versionId;
    this.valorVentaActual = props.valorVentaActual;
    this.valorPropietarioActual = props.valorPropietarioActual;
    this.produccionKgActual = props.produccionKgActual;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
  }
}
