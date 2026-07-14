/** Estados posibles de una solicitud de registro de caficultor. */
export const EstadoRegistroCaficultor = {
  pendiente: "pendiente",
  aprobado: "aprobado",
  rechazado: "rechazado",
} as const;

export type EstadoRegistroCaficultor =
  (typeof EstadoRegistroCaficultor)[keyof typeof EstadoRegistroCaficultor];
