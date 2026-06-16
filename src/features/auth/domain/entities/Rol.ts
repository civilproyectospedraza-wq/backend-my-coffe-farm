/** Roles disponibles para un usuario. */
export const Rol = {
  Administrador: "Administrador",
  Cliente: "Cliente",
} as const;

export type Rol = (typeof Rol)[keyof typeof Rol];
