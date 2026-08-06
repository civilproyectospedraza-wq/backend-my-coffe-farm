import { z } from "zod";

// Booleano que llega como string en query params ("true"/"false").
const queryBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const createCorreoAdministrativoNotificacionSchema = z.object({
  correo: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .max(255)
    .email("El correo no es válido")
    .transform((value) => value.toLowerCase()),
  estado: z.boolean().optional(),
  notificarVentasParcelas: z.boolean().optional(),
  notificarSolicitudesEntregaPropietarios: z.boolean().optional(),
});

export const updateCorreoAdministrativoNotificacionSchema = z
  .object({
    correo: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio")
      .max(255)
      .email("El correo no es válido")
      .transform((value) => value.toLowerCase())
      .optional(),
    estado: z.boolean().optional(),
    notificarVentasParcelas: z.boolean().optional(),
    notificarSolicitudesEntregaPropietarios: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export const correoAdministrativoNotificacionIdParamSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const listCorreosAdministrativosNotificacionesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).optional(),
  estado: queryBoolean.optional(),
  notificarVentasParcelas: queryBoolean.optional(),
  notificarSolicitudesEntregaPropietarios: queryBoolean.optional(),
});
