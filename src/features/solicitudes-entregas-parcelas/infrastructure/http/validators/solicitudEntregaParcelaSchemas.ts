import { z } from "zod";

// Estados de gestión válidos (espejo del enum `EstadoSolicitudEntrega`).
const estadoSolicitudEntregaSchema = z.enum([
  "pendiente",
  "en_gestion",
  "gestionada",
  "cancelado",
]);

// Crear solicitud de entrega. El propietario NO se recibe por body: se toma del
// JWT para que nadie pueda pedir entregas a nombre de otro.
export const createSolicitudEntregaParcelaSchema = z.object({
  parcelaId: z.string().uuid("parcelaId debe ser un UUID válido"),
  cantidadKg: z.coerce
    .number()
    .positive("La cantidad en kilos debe ser mayor a 0"),
});

// Listado paginado con filtros opcionales por parcela y estado.
export const listSolicitudesEntregasParcelasSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  parcelaId: z.string().uuid().optional(),
  estado: estadoSolicitudEntregaSchema.optional(),
});

// Resumen de conteos: mismos filtros que el listado pero sin paginación ni
// estado (el estado es justamente lo que se está contando). `propietarioId`
// solo lo aprovecha un Administrador; a un Propietario se le fuerza el suyo.
export const resumenSolicitudesEntregasParcelasSchema = z.object({
  parcelaId: z.string().uuid().optional(),
  propietarioId: z.string().uuid().optional(),
});

// Cambio de estado de gestión (solo Administrador). Cualquier estado del enum
// es un destino válido: la gestión no es un flujo rígido (una solicitud puede
// cancelarse o devolverse a pendiente).
export const updateEstadoSolicitudEntregaParcelaSchema = z.object({
  estado: estadoSolicitudEntregaSchema,
});

export const solicitudEntregaParcelaIdParamSchema = z.object({
  id: z.string().uuid("El id de la solicitud debe ser un UUID válido"),
});

export const parcelaIdParamSchema = z.object({
  parcelaId: z.string().uuid("El id de la parcela debe ser un UUID válido"),
});

// Listado de las solicitudes de una parcela: la parcela va en la ruta, así que
// del query solo se leen la paginación y el filtro por estado.
export const listSolicitudesPorParcelaSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  estado: estadoSolicitudEntregaSchema.optional(),
});
