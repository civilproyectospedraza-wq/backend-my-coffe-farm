export interface TarifaMetrajeVersionProps {
  id: string;
  tarifaMedidaId: string;
  valor: number;
  produccionKg: number;
  createdAt: Date;
  createdBy: string | null;
}

export class TarifaMetrajeVersion {
  readonly id: string;
  readonly tarifaMedidaId: string;
  readonly valor: number;
  readonly produccionKg: number;
  readonly createdAt: Date;
  readonly createdBy: string | null;

  constructor(props: TarifaMetrajeVersionProps) {
    this.id = props.id;
    this.tarifaMedidaId = props.tarifaMedidaId;
    this.valor = props.valor;
    this.produccionKg = props.produccionKg;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
  }
}

export interface TarifaMetrajeProps {
  id: string;
  medidaMetrosCuadrados: number;
  versionId: string | null;
  valorActual: number | null;
  produccionKgActual: number | null;
  createdAt: Date;
  createdBy: string | null;
}

export class TarifaMetraje {
  readonly id: string;
  readonly medidaMetrosCuadrados: number;
  readonly versionId: string | null;
  readonly valorActual: number | null;
  readonly produccionKgActual: number | null;
  readonly createdAt: Date;
  readonly createdBy: string | null;

  constructor(props: TarifaMetrajeProps) {
    this.id = props.id;
    this.medidaMetrosCuadrados = props.medidaMetrosCuadrados;
    this.versionId = props.versionId;
    this.valorActual = props.valorActual;
    this.produccionKgActual = props.produccionKgActual;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
  }
}
