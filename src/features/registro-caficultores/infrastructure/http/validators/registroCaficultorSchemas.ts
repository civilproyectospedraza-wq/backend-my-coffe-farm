import { z } from "zod";

export const createRegistroCaficultorSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150),
  email: z.string().email("Email inválido").max(100),
  telefono: z.string().max(20).nullable().optional(),
  direccion: z.string().nullable().optional(),
  // Obligatorios: el número de documento será la contraseña de acceso.
  tipoIdentificacion: z.enum(["CC", "CE", "TI", "PA", "NIT"]),
  identificacion: z
    .string()
    .min(3, "La identificación debe tener al menos 3 caracteres")
    .max(30),
});

export const listRegistrosCaficultorSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  estado: z.enum(["pendiente", "aprobado", "rechazado"]).optional(),
  search: z.string().trim().min(1).optional(),
});

export const rechazarRegistroCaficultorSchema = z.object({
  motivo: z
    .string()
    .min(3, "El motivo debe tener al menos 3 caracteres")
    .max(500),
});
