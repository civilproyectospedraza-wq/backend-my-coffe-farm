import { z } from "zod";

// Crear reporte: se envía como `multipart/form-data`. `parcelaId` es
// obligatorio; etapa y descripción son opcionales; las imágenes (opcionales)
// llegan como archivos en el campo `imagenes`.
export const createReporteSchema = z.object({
  parcelaId: z.string().uuid("parcelaId debe ser un UUID válido"),
  etapaId: z
    .string()
    .uuid("etapaId debe ser un UUID válido")
    .nullable()
    .optional(),
  descripcion: z.string().trim().min(1).max(2000).nullable().optional(),
});

// Listado paginado de reportes con filtro opcional por parcela.
export const listReportesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  parcelaId: z.string().uuid().optional(),
});
