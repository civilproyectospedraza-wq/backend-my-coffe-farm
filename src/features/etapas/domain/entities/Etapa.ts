export interface EtapaProps {
  id: string;
  nombre: string;
  descripcion: string | null;
  habilitadaVenta: boolean;
  orden: number;
  createdAt: Date;
}

export class Etapa {
  readonly id: string;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly habilitadaVenta: boolean;
  readonly orden: number;
  readonly createdAt: Date;

  constructor(props: EtapaProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion;
    this.habilitadaVenta = props.habilitadaVenta;
    this.orden = props.orden;
    this.createdAt = props.createdAt;
  }
}
