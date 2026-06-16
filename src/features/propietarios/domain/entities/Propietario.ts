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

export interface PropietarioProps {
  id: string;
  usuarioId: string;
  personaId: string;
  createdAt: Date;
  persona: PropietarioPersona;
  usuario: PropietarioUsuario;
}

export class Propietario {
  readonly id: string;
  readonly usuarioId: string;
  readonly personaId: string;
  readonly createdAt: Date;
  readonly persona: PropietarioPersona;
  readonly usuario: PropietarioUsuario;

  constructor(props: PropietarioProps) {
    this.id = props.id;
    this.usuarioId = props.usuarioId;
    this.personaId = props.personaId;
    this.createdAt = props.createdAt;
    this.persona = props.persona;
    this.usuario = props.usuario;
  }
}
