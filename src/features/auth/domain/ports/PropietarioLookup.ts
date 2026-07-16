/**
 * Puerto: resuelve el id del registro Propietario ligado a un usuario. Se usa
 * en el login y en la validación de sesión para exponer el `propietarioId`
 * (mismo id al que apunta `Finca.propietarioId`) sin acoplar auth a la feature
 * de propietarios.
 */
export interface PropietarioLookup {
  /** Id del Propietario cuyo `usuarioId` es el dado; null si no existe. */
  findIdByUsuarioId(usuarioId: string): Promise<string | null>;
}
