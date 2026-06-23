import Stripe from "stripe";
import { env } from "@shared/config/env";
import { AppError } from "@shared/errors/AppError";
import {
  CheckoutSession,
  CreateCheckoutInput,
  PaymentApprovedEvent,
  PaymentGateway,
} from "../../domain/ports/PaymentGateway";

// Monedas sin decimales en Stripe: el monto se envía como entero (no x100).
const ZERO_DECIMAL_CURRENCIES = new Set([
  "cop",
  "clp",
  "jpy",
  "krw",
  "vnd",
  "pyg",
]);

function toStripeAmount(valor: number, currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase())
    ? Math.round(valor)
    : Math.round(valor * 100);
}

function fromStripeAmount(amount: number, currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase())
    ? amount
    : amount / 100;
}

export class StripePaymentGateway implements PaymentGateway {
  private readonly client: Stripe;

  constructor() {
    if (!env.stripe.secretKey) {
      // Se construye igual para no romper el arranque; falla al usarse.
      this.client = new Stripe("sk_invalid_placeholder");
    } else {
      this.client = new Stripe(env.stripe.secretKey);
    }
  }

  async createCheckoutSession(
    input: CreateCheckoutInput
  ): Promise<CheckoutSession> {
    this.assertConfigured();

    const currency = env.stripe.currency;
    const session = await this.client.checkout.sessions.create({
      mode: "payment",
      customer_email: input.clienteEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            product_data: { name: input.descripcion },
            unit_amount: toStripeAmount(input.valor, currency),
          },
        },
      ],
      // metadata permite recuperar la venta desde el webhook.
      metadata: { ventaId: input.ventaId },
      success_url: env.stripe.successUrl,
      cancel_url: env.stripe.cancelUrl,
    });

    if (!session.url) {
      throw new AppError("Stripe no devolvió URL de pago", 502);
    }

    return { id: session.id, url: session.url };
  }

  parseApprovedPayment(
    rawBody: Buffer,
    signature: string
  ): PaymentApprovedEvent | null {
    this.assertConfigured();

    let event: Stripe.Event;
    try {
      event = this.client.webhooks.constructEvent(
        rawBody,
        signature,
        env.stripe.webhookSecret
      );
    } catch {
      // Firma inválida o secret mal configurado.
      throw new AppError("Firma de webhook de Stripe inválida", 400);
    }

    if (event.type !== "checkout.session.completed") {
      return null;
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return null;
    }

    const ventaId = session.metadata?.ventaId;
    if (!ventaId) {
      return null;
    }

    const moneda = session.currency ?? env.stripe.currency;
    return {
      eventId: event.id,
      ventaId,
      sessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      monto: fromStripeAmount(session.amount_total ?? 0, moneda),
      moneda,
      estado: session.payment_status,
    };
  }

  private assertConfigured(): void {
    if (!env.stripe.secretKey || !env.stripe.webhookSecret) {
      throw new AppError(
        "Stripe no está configurado: faltan STRIPE_SECRET_KEY y/o STRIPE_WEBHOOK_SECRET",
        500
      );
    }
  }
}
