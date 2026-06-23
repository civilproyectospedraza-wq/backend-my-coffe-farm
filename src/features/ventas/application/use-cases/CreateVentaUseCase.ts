import { PaymentGateway } from "../../domain/ports/PaymentGateway";
import { VentaRepository } from "../../domain/ports/VentaRepository";
import { CreateVentaInput, CreateVentaResult } from "../dtos/VentaDtos";

/**
 * Registra una venta en estado `pendiente` con los datos del comprador y crea
 * la sesión de pago en Stripe. Devuelve la URL a la que redirigir al cliente.
 * No crea User/Persona/Cliente todavía: eso ocurre al confirmarse el pago.
 */
export class CreateVentaUseCase {
  constructor(
    private readonly ventaRepository: VentaRepository,
    private readonly paymentGateway: PaymentGateway
  ) {}

  async execute(input: CreateVentaInput): Promise<CreateVentaResult> {
    const venta = await this.ventaRepository.create({
      parcelaId: input.parcelaId,
      valor: input.valor,
      comprador: input.comprador,
      createdBy: input.createdBy,
    });

    const session = await this.paymentGateway.createCheckoutSession({
      ventaId: venta.id,
      valor: venta.valor,
      descripcion: `Venta de parcela ${venta.parcelaId}`,
      clienteEmail: venta.comprador.email,
    });

    await this.ventaRepository.setStripeSession(venta.id, session.id);

    return { venta, checkoutUrl: session.url };
  }
}
