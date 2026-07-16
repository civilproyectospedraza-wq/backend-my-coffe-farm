import { Rol } from "../entities/Rol";

export interface TokenPayload {
  sub: string;
  email: string;
  rol: Rol;
  // Solo presente cuando el usuario es un Propietario: el id de su registro
  // Propietario. Se lleva como claim para poder filtrar en el backend sin
  // consultas extra (fincas/parcelas propias).
  propietarioId?: string;
}

/** Puerto: generación y verificación de tokens (JWT u otro). */
export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
