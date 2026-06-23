import { PaginationParams } from "@shared/domain/pagination";
import { DatosComprador, EstadoVenta, Venta } from "../../domain/entities/Venta";

export interface CreateVentaInput {
  parcelaId: string;
  valor: number;
  comprador: DatosComprador;
  // Usuario que registra la venta; null si la inicia un cliente anónimo.
  createdBy?: string | null;
}

// Respuesta de crear venta: la venta y la URL de pago de Stripe Checkout.
export interface CreateVentaResult {
  venta: Venta;
  checkoutUrl: string;
}

export interface ListVentasInput extends PaginationParams {
  estado?: EstadoVenta;
  parcelaId?: string;
}

// Item del listado paginado de ventas.
export interface VentaListItem {
  id: string;
  estado: EstadoVenta;
  valor: number;
  parcela: { id: string; nombre: string };
  comprador: { nombre: string; email: string };
  clienteId: string | null;
  suscripcionId: string | null;
  createdAt: string;
}
