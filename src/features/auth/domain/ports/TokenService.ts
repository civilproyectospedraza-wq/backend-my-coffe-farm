import { Rol } from "../entities/Rol";

export interface TokenPayload {
  sub: string;
  email: string;
  rol: Rol;
}

/** Puerto: generación y verificación de tokens (JWT u otro). */
export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
