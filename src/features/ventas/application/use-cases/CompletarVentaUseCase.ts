import { randomBytes } from "crypto";
import { PasswordHasher } from "@features/auth/domain/ports/PasswordHasher";
import { Venta } from "../../domain/entities/Venta";
import { PaymentApprovedEvent } from "../../domain/ports/PaymentGateway";
import {
  TransaccionStripeData,
  VentaRepository,
} from "../../domain/ports/VentaRepository";

const MESES_CONTRATO = 12;

/**
 * Completa una venta tras confirmarse el pago: crea (o reutiliza) el cliente
 * con una contraseña temporal, la suscripción, la facturación y la transacción,
 * y deja la parcela ocupada. Las fechas del contrato se calculan automáticamente
 * (inicio = ahora, fin = +12 meses).
 */
export class CompletarVentaUseCase {
  constructor(
    private readonly ventaRepository: VentaRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  /** Invocado por el webhook de Stripe con el pago ya aprobado. */
  async completarDesdePago(evento: PaymentApprovedEvent): Promise<Venta> {
    return this.completar(evento.ventaId, {
      eventId: evento.eventId,
      sessionId: evento.sessionId,
      paymentIntentId: evento.paymentIntentId,
      monto: evento.monto,
      moneda: evento.moneda,
      estado: evento.estado,
    });
  }

  /** Completación directa (admin/offline) sin transacción de Stripe. */
  async completarManual(ventaId: string): Promise<Venta> {
    return this.completar(ventaId);
  }

  private async completar(
    ventaId: string,
    transaccion?: TransaccionStripeData
  ): Promise<Venta> {
    const passwordHash = await this.passwordHasher.hash(this.tempPassword());

    const fechaInicio = new Date();
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + MESES_CONTRATO);

    return this.ventaRepository.completar(ventaId, {
      fechaInicio,
      fechaFin,
      passwordHash,
      transaccion,
    });
  }

  /** Contraseña temporal aleatoria (el cliente la restablece luego). */
  private tempPassword(): string {
    return randomBytes(12).toString("base64url");
  }
}
