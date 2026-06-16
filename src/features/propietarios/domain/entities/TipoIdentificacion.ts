/** Tipos de documento de identificación de una persona. */
export const TipoIdentificacion = {
  CC: "CC",
  CE: "CE",
  TI: "TI",
  PA: "PA",
  NIT: "NIT",
} as const;

export type TipoIdentificacion =
  (typeof TipoIdentificacion)[keyof typeof TipoIdentificacion];
