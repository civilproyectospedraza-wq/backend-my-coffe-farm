import { EstadoSolicitudEntrega } from "./EstadoSolicitudEntrega";

export interface SolicitudEntregaParcelaProps {
  id: string;
  parcelaId: string;
  cantidadKg: number;
  /** Versión de tarifa con la que se le va a pagar al propietario. */
  tarifaVersionId: string | null;
  /** Estimado de pago congelado al crear (cantidadKg × valor por kg). */
  valor: number | null;
  estado: EstadoSolicitudEntrega;
  createdAt: Date;
}

export class SolicitudEntregaParcela {
  readonly id: string;
  readonly parcelaId: string;
  readonly cantidadKg: number;
  readonly tarifaVersionId: string | null;
  readonly valor: number | null;
  readonly estado: EstadoSolicitudEntrega;
  readonly createdAt: Date;

  constructor(props: SolicitudEntregaParcelaProps) {
    this.id = props.id;
    this.parcelaId = props.parcelaId;
    this.cantidadKg = props.cantidadKg;
    this.tarifaVersionId = props.tarifaVersionId;
    this.valor = props.valor;
    this.estado = props.estado;
    this.createdAt = props.createdAt;
  }
}
