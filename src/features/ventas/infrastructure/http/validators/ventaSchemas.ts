import { z } from "zod";

// Crear venta: la versión de parcela se deriva en el servidor de la versión
// actual de la parcela. Los datos del comprador se guardan inline.
export const createVentaSchema = z.object({
  parcelaId: z.string().uuid("parcelaId debe ser un UUID válido"),
  valor: z.coerce.number().positive("El valor debe ser mayor a 0"),
  comprador: z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(150),
    email: z.string().email("Email inválido").max(100),
    telefono: z.string().max(20).nullable().optional(),
    direccion: z.string().nullable().optional(),
    tipoIdentificacion: z
      .enum(["CC", "CE", "TI", "PA", "NIT"])
      .nullable()
      .optional(),
    identificacion: z.string().max(30).nullable().optional(),
  }),
});

export const ventaIdParamSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});

export const listVentasSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  estado: z.enum(["pendiente", "pagado"]).optional(),
  parcelaId: z.string().uuid().optional(),
});
