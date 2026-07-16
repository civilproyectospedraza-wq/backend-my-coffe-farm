import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@shared/errors/AppError";
import { Rol } from "@features/auth/domain/entities/Rol";

/**
 * Restringe una ruta a los roles indicados. Debe usarse SIEMPRE después de
 * `authMiddleware`, que es quien llena `req.user`.
 *
 * Sin token (o inválido) → 401 (lo resuelve `authMiddleware`). Autenticado pero
 * con un rol no permitido → 403 (autenticado pero sin permiso para la acción).
 */
export function requireRole(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Token no proporcionado");
    }
    if (!roles.includes(req.user.rol)) {
      throw new ForbiddenError("No tienes permisos para esta acción");
    }
    next();
  };
}
