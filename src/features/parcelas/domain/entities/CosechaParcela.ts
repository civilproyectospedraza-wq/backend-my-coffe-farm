/**
 * Regla de negocio de la cosecha de una parcela: la temporalidad indica cuántas
 * veces al año cosecha (1 a 12) y `meses_cosecha_parcela` guarda exactamente
 * esa cantidad de meses, sin repetirlos.
 */

export const MES_MIN = 1;
export const MES_MAX = 12;

/**
 * Valida la pareja temporalidad/meses. Devuelve el mensaje de error o `null`
 * si es válida. Ambos datos son opcionales, pero van juntos: no se puede
 * definir uno sin el otro.
 */
export function validarCosecha(
  temporalidadCosecha: number | null | undefined,
  mesesCosecha: number[] | undefined
): string | null {
  const tieneTemporalidad =
    temporalidadCosecha !== null && temporalidadCosecha !== undefined;
  const tieneMeses = mesesCosecha !== undefined;

  if (!tieneTemporalidad && !tieneMeses) {
    return null;
  }

  if (!tieneTemporalidad) {
    return "Debes enviar temporalidadCosecha junto con mesesCosecha";
  }

  if (!tieneMeses) {
    return "Debes enviar mesesCosecha junto con temporalidadCosecha";
  }

  if (mesesCosecha.length !== temporalidadCosecha) {
    return `La temporalidad de cosecha es ${temporalidadCosecha}, así que debes enviar ${temporalidadCosecha} mes(es) de cosecha (recibidos: ${mesesCosecha.length})`;
  }

  if (new Set(mesesCosecha).size !== mesesCosecha.length) {
    return "Los meses de cosecha no pueden repetirse";
  }

  return null;
}
