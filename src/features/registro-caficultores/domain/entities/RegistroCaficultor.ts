import { TipoIdentificacion } from "@features/propietarios/domain/entities/TipoIdentificacion";
import { EstadoRegistroCaficultor } from "./EstadoRegistroCaficultor";

export interface RegistroCaficultorProps {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  tipoIdentificacion: TipoIdentificacion;
  identificacion: string;
  estado: EstadoRegistroCaficultor;
  motivoRechazo: string | null;
  propietarioId: string | null;
  revisadoPor: string | null;
  revisadoAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RegistroCaficultor {
  readonly id: string;
  readonly nombre: string;
  readonly email: string;
  readonly telefono: string | null;
  readonly direccion: string | null;
  readonly tipoIdentificacion: TipoIdentificacion;
  readonly identificacion: string;
  readonly estado: EstadoRegistroCaficultor;
  readonly motivoRechazo: string | null;
  readonly propietarioId: string | null;
  readonly revisadoPor: string | null;
  readonly revisadoAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: RegistroCaficultorProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.email = props.email;
    this.telefono = props.telefono;
    this.direccion = props.direccion;
    this.tipoIdentificacion = props.tipoIdentificacion;
    this.identificacion = props.identificacion;
    this.estado = props.estado;
    this.motivoRechazo = props.motivoRechazo;
    this.propietarioId = props.propietarioId;
    this.revisadoPor = props.revisadoPor;
    this.revisadoAt = props.revisadoAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
