import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@shared/errors/AppError";
import { Rol } from "@features/auth/domain/entities/Rol";

/**
 * Restringe una ruta a los roles indicados. Debe usarse SIEMPRE después de
 * `authMiddleware`, que es quien llena `req.user`.
 */
export function requireRole(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Token no proporcionado");
    }
    if (!roles.includes(req.user.rol)) {
      throw new UnauthorizedError("No tienes permisos para esta acción");
    }
    next();
  };
}
