import { Request } from "express";
import { Rol } from "@features/auth/domain/entities/Rol";
import { ForbiddenError } from "@shared/errors/AppError";

/**
 * Resuelve el `propietarioId` efectivo para filtrar listados (fincas/parcelas).
 *
 * Seguridad: el query param es solo para UX. Si el usuario autenticado es un
 * Propietario, se FUERZA su propio id (tomado del JWT), ignorando lo que venga
 * por la URL — así no puede ver datos de otro propietario. Para el resto de
 * roles (p. ej. Administrador) el filtro es opcional y se respeta el query param
 * (sin él, el listado devuelve todo).
 */
export function resolvePropietarioScope(
  req: Request,
  queryPropietarioId?: string
): string | undefined {
  if (req.user?.rol === Rol.Propietario) {
    if (!req.user.propietarioId) {
      // Token de propietario sin claim: se rechaza en vez de exponer todo.
      throw new ForbiddenError(
        "No se pudo determinar el propietario del usuario; vuelve a iniciar sesión."
      );
    }
    return req.user.propietarioId;
  }
  return queryPropietarioId;
}
