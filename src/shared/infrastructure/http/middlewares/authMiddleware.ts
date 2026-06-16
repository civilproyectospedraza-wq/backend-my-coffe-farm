import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@shared/errors/AppError";
import { authTokenService } from "@features/auth/infrastructure/auth.module";
import { Rol } from "@features/auth/domain/entities/Rol";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; rol: Rol };
    }
  }
}

/** Protege rutas verificando el JWT enviado en el header Authorization. */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token no proporcionado");
  }

  const token = header.slice("Bearer ".length).trim();
  const payload = authTokenService.verify(token);

  req.user = { id: payload.sub, email: payload.email, rol: payload.rol };
  next();
}
