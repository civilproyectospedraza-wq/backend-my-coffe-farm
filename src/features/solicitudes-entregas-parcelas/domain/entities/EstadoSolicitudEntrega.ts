/**
 * Estado de gestión de una solicitud de entrega. Nace `pendiente`, pasa a
 * `en_gestion` mientras se atiende y termina en `gestionada` (atendida) o
 * `cancelado` (descartada).
 */
export const EstadoSolicitudEntrega = {
  pendiente: "pendiente",
  en_gestion: "en_gestion",
  gestionada: "gestionada",
  cancelado: "cancelado",
} as const;

export type EstadoSolicitudEntrega =
  (typeof EstadoSolicitudEntrega)[keyof typeof EstadoSolicitudEntrega];
