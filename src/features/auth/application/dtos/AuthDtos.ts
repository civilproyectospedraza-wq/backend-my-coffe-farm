export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

import { Rol } from "../../domain/entities/Rol";

export interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    rol: Rol;
  };
}
