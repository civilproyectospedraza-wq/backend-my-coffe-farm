import { Rol } from "@features/auth/domain/entities/Rol";
import { TipoIdentificacion } from "./TipoIdentificacion";

export interface PropietarioPersona {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  email: string | null;
  tipoIdentificacion: TipoIdentificacion | null;
  identificacion: string | null;
}

export interface PropietarioUsuario {
  id: string;
  name: string;
  email: string;
  rol: Rol;
}

export type EstadoPropietario = "pendiente" | "activo";

export interface PropietarioProps {
  id: string;
  // Nulo mientras la cuenta está `pendiente`: el usuario se crea al activar.
  usuarioId: string | null;
  personaId: string;
  estado: EstadoPropietario;
  createdAt: Date;
  persona: PropietarioPersona;
  usuario: PropietarioUsuario | null;
}

export class Propietario {
  readonly id: string;
  readonly usuarioId: string | null;
  readonly personaId: string;
  readonly estado: EstadoPropietario;
  readonly createdAt: Date;
  readonly persona: PropietarioPersona;
  readonly usuario: PropietarioUsuario | null;

  constructor(props: PropietarioProps) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.personaId = props.personaId;
    this.estado = props.estado;
    this.createdAt = props.createdAt;
    this.persona = props.persona;
    this.usuario = props.usuario;
  }
}
