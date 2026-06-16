import { z } from "zod";

const latitud = z.coerce.number().min(-90).max(90);
const longitud = z.coerce.number().min(-180).max(180);

export const createFincaSchema = z.object({
  propietarioId: z.string().uuid("propietarioId debe ser un UUID válido"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(100),
  ubicacion: z.string().min(1, "La ubicación es obligatoria"),
  municipio: z.string().min(1, "El municipio es obligatorio").max(100),
  departamento: z.string().min(1, "El departamento es obligatorio").max(100),
  altitudMetros: z.coerce.number().int().nonnegative().nullable().optional(),
  latitud: latitud.nullable().optional(),
  longitud: longitud.nullable().optional(),
  descripcion: z.string().nullable().optional(),
});

// Sin `.refine` de "al menos un campo": una actualización válida puede
// consistir únicamente en una nueva imagen (que llega como archivo, no en el
// body). Esa validación se hace en UpdateFincaUseCase.
export const updateFincaSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  ubicacion: z.string().min(1).optional(),
  municipio: z.string().min(1).max(100).optional(),
  departamento: z.string().min(1).max(100).optional(),
  altitudMetros: z.coerce.number().int().nonnegative().nullable().optional(),
  latitud: latitud.nullable().optional(),
  longitud: longitud.nullable().optional(),
  descripcion: z.string().nullable().optional(),
});

export const listFincasSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const buscarFincasSchema = z.object({
  search: z.string().trim().min(1, "El término de búsqueda es obligatorio"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const fincaIdParamSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const resumenFincaQuerySchema = z.object({
  fechaInicio: z.coerce.date({
    errorMap: () => ({ message: "fechaInicio debe ser una fecha válida" }),
  }),
  fechaFin: z.coerce.date({
    errorMap: () => ({ message: "fechaFin debe ser una fecha válida" }),
  }),
});
