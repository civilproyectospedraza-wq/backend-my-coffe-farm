import { z } from "zod";

// Booleano que llega como string en query params ("true"/"false").
const queryBoolean = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const createEtapaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(100),
  descripcion: z.string().nullable().optional(),
  habilitadaVenta: z.boolean().optional(),
  orden: z.coerce.number().int("El orden debe ser un entero").min(0),
});

export const updateEtapaSchema = z
  .object({
    nombre: z.string().min(1).max(100).optional(),
    descripcion: z.string().nullable().optional(),
    habilitadaVenta: z.boolean().optional(),
    orden: z.coerce.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export const listEtapasSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  habilitadaVenta: queryBoolean.optional(),
});

export const buscarEtapasSchema = z.object({
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

export const etapaIdParamSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});
