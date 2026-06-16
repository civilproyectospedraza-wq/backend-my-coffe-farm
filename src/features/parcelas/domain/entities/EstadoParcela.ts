/** Estado de disponibilidad de una parcela. */
export const EstadoParcela = {
  disponible: "disponible",
  ocupada: "ocupada",
} as const;

export type EstadoParcela =
  (typeof EstadoParcela)[keyof typeof EstadoParcela];
