import { z } from "zod";

// Crear entrega: se envía como `multipart/form-data`. El comprobante de pago
// (opcional) llega como archivo en el campo `imagen`.
export const createEntregaSchema = z.object({
  // Toda entrega responde a una solicitud en gestión; de ahí sale la parcela.
  solicitudId: z.string().uuid("solicitudId debe ser un UUID válido"),
  // Opcional: la parcela entrega esté alquilada o no. Si viene, el repositorio
  // verifica que la suscripción sea de la parcela de la solicitud.
  suscripcionId: z
    .string()
    .uuid("suscripcionId debe ser un UUID válido")
    .optional(),
  cantidadEntregada: z.coerce
    .number()
    .positive("La cantidad entregada debe ser mayor a 0"),
  valorPagado: z.coerce
    .number()
    .nonnegative("El valor pagado no puede ser negativo"),
});

// Editar entrega: todos los campos son opcionales. Una actualización válida
// puede consistir solo en un nuevo comprobante (archivo). Esa validación de
// "al menos un campo" se hace en UpdateEntregaUseCase.
export const updateEntregaSchema = z.object({
  cantidadEntregada: z.coerce.number().positive().optional(),
  valorPagado: z.coerce.number().nonnegative().optional(),
});

// Listado paginado de entregas con filtros opcionales.
export const listEntregasSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  parcelaId: z.string().uuid().optional(),
  suscripcionId: z.string().uuid().optional(),
  solicitudId: z.string().uuid().optional(),
});

export const entregaIdParamSchema = z.object({
  id: z.string().uuid("El id debe ser un UUID válido"),
});
