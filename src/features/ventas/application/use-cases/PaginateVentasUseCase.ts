import { PaginatedResult } from "@shared/domain/pagination";
import { VentaRepository } from "../../domain/ports/VentaRepository";
import { ListVentasInput, VentaListItem } from "../dtos/VentaDtos";

/**
 * Listado paginado de ventas (de la más reciente a la más antigua), con filtros
 * opcionales por estado y por parcela.
 */
export class PaginateVentasUseCase {
  constructor(private readonly ventaRepository: VentaRepository) {}

  async execute(
    input: ListVentasInput
  ): Promise<PaginatedResult<VentaListItem>> {
    const result = await this.ventaRepository.findMany(input);

    const data: VentaListItem[] = result.data.map((venta) => ({
      id: venta.id,
      estado: venta.estado,
      valor: venta.valor,
      parcela: { id: venta.parcelaId, nombre: venta.parcelaNombre },
      comprador: { nombre: venta.compradorNombre, email: venta.compradorEmail },
      clienteId: venta.clienteId,
      suscripcionId: venta.suscripcionId,
      createdAt: venta.createdAt.toISOString(),
    }));

    return { ...result, data };
  }
}
