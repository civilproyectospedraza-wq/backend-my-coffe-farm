export interface TarifaMetrajeVersionProps {
  id: string;
  tarifaMedidaId: string;
  valorVenta: number;
  valorProduccionPropietarioPorKg: number;
  produccionKg: number;
  cantidadMinimaEntrega: number;
  createdAt: Date;
  createdBy: string | null;
}

export class TarifaMetrajeVersion {
  readonly id: string;
  readonly tarifaMedidaId: string;
  readonly valorVenta: number;
  // Valor pagado al propietario por cada kg entregado.
  readonly valorProduccionPropietarioPorKg: number;
  readonly produccionKg: number;
  readonly cantidadMinimaEntrega: number;
  readonly createdAt: Date;
  readonly createdBy: string | null;

  constructor(props: TarifaMetrajeVersionProps) {
    this.id = props.id;
    this.tarifaMedidaId = props.tarifaMedidaId;
    this.valorVenta = props.valorVenta;
    this.valorProduccionPropietarioPorKg =
      props.valorProduccionPropietarioPorKg;
    this.produccionKg = props.produccionKg;
    this.cantidadMinimaEntrega = props.cantidadMinimaEntrega;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
  }
}

export interface TarifaMetrajeProps {
  id: string;
  medidaMetrosCuadrados: number;
  versionId: string | null;
  valorVentaActual: number | null;
  valorProduccionPropietarioPorKgActual: number | null;
  produccionKgActual: number | null;
  cantidadMinimaEntregaActual: number | null;
  createdAt: Date;
  createdBy: string | null;
}

export class TarifaMetraje {
  readonly id: string;
  readonly medidaMetrosCuadrados: number;
  readonly versionId: string | null;
  readonly valorVentaActual: number | null;
  readonly valorProduccionPropietarioPorKgActual: number | null;
  readonly produccionKgActual: number | null;
  readonly cantidadMinimaEntregaActual: number | null;
  readonly createdAt: Date;
  readonly createdBy: string | null;

  constructor(props: TarifaMetrajeProps) {
    this.id = props.id;
    this.medidaMetrosCuadrados = props.medidaMetrosCuadrados;
    this.versionId = props.versionId;
    this.valorVentaActual = props.valorVentaActual;
    this.valorProduccionPropietarioPorKgActual =
      props.valorProduccionPropietarioPorKgActual;
    this.produccionKgActual = props.produccionKgActual;
    this.cantidadMinimaEntregaActual = props.cantidadMinimaEntregaActual;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
  }
}
