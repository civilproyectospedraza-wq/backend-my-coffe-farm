import jwt, { SignOptions } from "jsonwebtoken";
import { UnauthorizedError } from "@shared/errors/AppError";
import {
  TokenPayload,
  TokenService,
} from "../../domain/ports/TokenService";

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as SignOptions["expiresIn"],
    };
    return jwt.sign(payload, this.secret, options);
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (typeof decoded === "string") {
        throw new UnauthorizedError("Token inválido");
      }
      return {
        sub: String(decoded.sub),
        email: String(decoded.email),
        rol: decoded.rol as TokenPayload["rol"],
      };
    } catch {
      throw new UnauthorizedError("Token inválido o expirado");
    }
  }
}
