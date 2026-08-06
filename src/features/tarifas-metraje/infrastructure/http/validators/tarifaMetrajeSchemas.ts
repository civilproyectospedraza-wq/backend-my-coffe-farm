import { z } from "zod";

export const createTarifaMetrajeSchema = z.object({
  medidaMetrosCuadrados: z.coerce
    .number({ invalid_type_error: "La medida debe ser numérica" })
    .positive("La medida debe ser mayor que 0"),
  valorVenta: z.coerce
    .number({ invalid_type_error: "El valor de venta debe ser numérico" })
    .nonnegative("El valor de venta no puede ser negativo"),
  valorProduccionPropietarioPorKg: z.coerce
    .number({
      invalid_type_error:
        "El valor de producción al propietario por kg debe ser numérico",
    })
    .nonnegative(
      "El valor de producción al propietario por kg no puede ser negativo"
    ),
  produccionKg: z.coerce
    .number({ invalid_type_error: "La producción debe ser numérica" })
    .nonnegative("La producción no puede ser negativa"),
  cantidadMinimaEntrega: z.coerce
    .number({
      invalid_type_error: "La cantidad mínima de entrega debe ser numérica",
    })
    .nonnegative("La cantidad mínima de entrega no puede ser negativa"),
});

export const createTarifaMetrajeVersionSchema = z.object({
  valorVenta: z.coerce
    .number({ invalid_type_error: "El valor de venta debe ser numérico" })
    .nonnegative("El valor de venta no puede ser negativo"),
  valorProduccionPropietarioPorKg: z.coerce
    .number({
      invalid_type_error:
        "El valor de producción al propietario por kg debe ser numérico",
    })
    .nonnegative(
      "El valor de producción al propietario por kg no puede ser negativo"
    ),
  produccionKg: z.coerce
    .number({ invalid_type_error: "La producción debe ser numérica" })
    .nonnegative("La producción no puede ser negativa"),
  cantidadMinimaEntrega: z.coerce
    .number({
      invalid_type_error: "La cantidad mínima de entrega debe ser numérica",
    })
    .nonnegative("La cantidad mínima de entrega no puede ser negativa"),
});

export const listTarifasMetrajeSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const tarifaMetrajeIdParamSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const parcelaIdParamSchema = z.object({
  parcelaId: z.string().uuid("El parcelaId debe ser un UUID válido"),
});
