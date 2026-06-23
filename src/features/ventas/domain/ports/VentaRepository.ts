import { PaginatedResult, PaginationParams } from "@shared/domain/pagination";
import { DatosComprador, EstadoVenta, Venta } from "../entities/Venta";

// Datos para registrar una venta. La versión de parcela se deriva de la
// parcela (su versión actual). El comprador se guarda inline.
export interface CreateVentaData {
  parcelaId: string;
  valor: number;
  comprador: DatosComprador;
  createdBy?: string | null;
}

// Datos de la transacción de Stripe asociada al pago (para TransaccionStripe).
export interface TransaccionStripeData {
  eventId: string;
  sessionId: string;
  paymentIntentId: string | null;
  monto: number;
  moneda: string;
  estado: string;
}

// Datos para completar (marcar como pagada) una venta.
export interface CompletarVentaData {
  fechaInicio: Date;
  fechaFin: Date;
  // Hash de la contraseña temporal del cliente que se crea al completar.
  passwordHash: string;
  // Datos de la transacción Stripe; ausente en una completación manual/offline.
  transaccion?: TransaccionStripeData;
}

// Filtros del listado paginado de ventas.
export interface ListVentasParams extends PaginationParams {
  estado?: EstadoVenta;
  parcelaId?: string;
}

// Fila del listado de ventas (incluye el nombre de la parcela).
export interface VentaListItemRaw {
  id: string;
  estado: EstadoVenta;
  valor: number;
  parcelaId: string;
  parcelaNombre: string;
  compradorNombre: string;
  compradorEmail: string;
  clienteId: string | null;
  suscripcionId: string | null;
  createdAt: Date;
}

export interface VentaRepository {
  /** Crea una venta en estado `pendiente` con los datos del comprador. */
  create(data: CreateVentaData): Promise<Venta>;

  findById(id: string): Promise<Venta | null>;

  /** Listado paginado de ventas (de la más reciente a la más antigua). */
  findMany(params: ListVentasParams): Promise<PaginatedResult<VentaListItemRaw>>;

  /** Guarda el id de la sesión de Stripe Checkout asociada a la venta. */
  setStripeSession(id: string, sessionId: string): Promise<void>;

  /**
   * Marca la venta como `pagado` de forma atómica: crea (o reutiliza) el
   * User/Persona/Cliente con rol Cliente, la suscripción, la facturación y la
   * transacción de Stripe, enlaza todo y deja la parcela `ocupada`.
   * Es idempotente: si la venta ya está pagada, no duplica nada.
   */
  completar(id: string, data: CompletarVentaData): Promise<Venta>;
}
