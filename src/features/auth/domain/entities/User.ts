import { Rol } from "./Rol";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  rol: Rol;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly rol: Rol;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.rol = props.rol;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Representación segura del usuario, sin exponer la contraseña. */
  toPublic() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      rol: this.rol,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
