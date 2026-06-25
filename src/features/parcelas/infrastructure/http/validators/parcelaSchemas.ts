import { z } from "zod";

const latitud = z.coerce.number().min(-90).max(90);
const longitud = z.coerce.number().min(-180).max(180);

// Crear parcela: se envía como `multipart/form-data` porque incluye las
// imágenes de portada (campo `imagenes`). `etapaId` y las imágenes son
// opcionales; si llega `etapaId` fija la etapa actual.
export const createParcelaSchema = z.object({
  fincaId: z.string().uuid("fincaId debe ser un UUID válido"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(100),
  descripcion: z.string().nullable().optional(),
  areaMetrosCuadrados: z.coerce.number().positive().nullable().optional(),
  precioAlquiler: z.coerce.number().positive("El precio debe ser mayor a 0"),
  estado: z.enum(["disponible", "ocupada"]).optional(),
  latitud: latitud.nullable().optional(),
  longitud: longitud.nullable().optional(),
  etapaId: z.string().uuid("etapaId debe ser un UUID válido").optional(),
});

// Actualizar parcela: se envía como `multipart/form-data` para poder incluir
// imágenes de portada (campo `imagenes`). Todos los campos son opcionales; si
// llegan imágenes, reemplazan la portada. La validación de "al menos un
// cambio" (campos o imágenes) se hace en el caso de uso.
export const updateParcelaSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().nullable().optional(),
  areaMetrosCuadrados: z.coerce.number().positive().nullable().optional(),
  precioAlquiler: z.coerce.number().positive().optional(),
  etapaActualId: z.string().uuid().nullable().optional(),
  estado: z.enum(["disponible", "ocupada"]).optional(),
  latitud: latitud.nullable().optional(),
  longitud: longitud.nullable().optional(),
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

// Catálogo público: no expone el filtro por estado (siempre "disponible").
export const listCatalogParcelasSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  fincaId: z.string().uuid().optional(),
});
