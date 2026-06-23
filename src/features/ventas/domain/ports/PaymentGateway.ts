export interface CreateCheckoutInput {
  ventaId: string;
  valor: number;
  descripcion: string;
  clienteEmail: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

// Evento de pago aprobado, normalizado (independiente de Stripe).
export interface PaymentApprovedEvent {
  eventId: string;
  ventaId: string;
  sessionId: string;
  paymentIntentId: string | null;
  monto: number;
  moneda: string;
  estado: string;
}

export interface PaymentGateway {
  /** Crea la sesión de pago y devuelve la URL a la que redirigir al cliente. */
  createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession>;

  /**
   * Verifica la firma del webhook y devuelve el evento normalizado si es un
   * pago aprobado relevante; `null` para eventos que se deben ignorar.
   */
  parseApprovedPayment(
    rawBody: Buffer,
    signature: string
  ): PaymentApprovedEvent | null;
}
