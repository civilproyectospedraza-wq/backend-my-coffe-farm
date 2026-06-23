export type EstadoVenta = "pendiente" | "pagado";

export type TipoIdentificacion = "CC" | "CE" | "TI" | "PA" | "NIT";

// Datos del comprador capturados al crear la venta (antes de existir el Cliente).
export interface DatosComprador {
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  tipoIdentificacion: TipoIdentificacion | null;
  identificacion: string | null;
}

export interface VentaProps {
  id: string;
  versionParcelaId: string;
  parcelaId: string;
  clienteId: string | null;
  valor: number;
  estado: EstadoVenta;
  suscripcionId: string | null;
  comprador: DatosComprador;
  stripeSessionId: string | null;
  createdAt: Date;
  createdBy: string | null;
}

export class Venta {
  readonly id: string;
  readonly versionParcelaId: string;
  readonly parcelaId: string;
  readonly clienteId: string | null;
  readonly valor: number;
  readonly estado: EstadoVenta;
  readonly suscripcionId: string | null;
  readonly comprador: DatosComprador;
  readonly stripeSessionId: string | null;
  readonly createdAt: Date;
  readonly createdBy: string | null;

  constructor(props: VentaProps) {
    this.id = props.id;
    this.versionParcelaId = props.versionParcelaId;
    this.parcelaId = props.parcelaId;
    this.clienteId = props.clienteId;
    this.valor = props.valor;
    this.estado = props.estado;
    this.suscripcionId = props.suscripcionId;
    this.comprador = props.comprador;
    this.stripeSessionId = props.stripeSessionId;
    this.createdAt = props.createdAt;
    this.createdBy = props.createdBy;
  }
}
