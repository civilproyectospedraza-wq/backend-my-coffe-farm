import { z } from "zod";

export const createPropietarioSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(150),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  telefono: z.string().max(20).nullable().optional(),
  direccion: z.string().nullable().optional(),
  tipoIdentificacion: z
    .enum(["CC", "CE", "TI", "PA", "NIT"])
    .nullable()
    .optional(),
  identificacion: z.string().max(30).nullable().optional(),
});

export const listPropietariosSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).optional(),
});
