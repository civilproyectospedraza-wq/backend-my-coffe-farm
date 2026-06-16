import { z } from "zod";

const latitud = z.coerce.number().min(-90).max(90);
const longitud = z.coerce.number().min(-180).max(180);

export const createParcelaSchema = z.object({
  fincaId: z.string().uuid("fincaId debe ser un UUID válido"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(100),
  descripcion: z.string().nullable().optional(),
  areaHectareas: z.coerce.number().positive().nullable().optional(),
  precioAlquiler: z.coerce.number().positive("El precio debe ser mayor a 0"),
  etapaActualId: z.string().uuid().nullable().optional(),
  estado: z.enum(["disponible", "ocupada"]).optional(),
  latitud: latitud.nullable().optional(),
  longitud: longitud.nullable().optional(),
});

export const updateParcelaSchema = z
  .object({
    nombre: z.string().min(1).max(100).optional(),
    descripcion: z.string().nullable().optional(),
    areaHectareas: z.coerce.number().positive().nullable().optional(),
    precioAlquiler: z.coerce.number().positive().optional(),
    etapaActualId: z.string().uuid().nullable().optional(),
    estado: z.enum(["disponible", "ocupada"]).optional(),
    latitud: latitud.nullable().optional(),
    longitud: longitud.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export const listParcelasSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  fincaId: z.string().uuid().optional(),
  estado: z.enum(["disponible", "ocupada"]).optional(),
});

export const parcelaIdParamSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

// Registrar novedad: etapa y descripción opcionales; las imágenes (opcionales)
// llegan como archivos en `multipart/form-data`, no en el body.
export const registrarNovedadSchema = z.object({
  etapaId: z.string().uuid("etapaId debe ser un UUID válido").nullable().optional(),
  descripcion: z.string().trim().min(1).max(2000).nullable().optional(),
});

// Catálogo público: no expone el filtro por estado (siempre "disponible").
export const listCatalogParcelasSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  fincaId: z.string().uuid().optional(),
});
