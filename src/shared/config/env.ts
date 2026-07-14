import dotenv from "dotenv";

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variable de entorno faltante: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
  aws: {
    accessKeyId: required("AWS_ACCESS_KEY_ID"),
    secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
    region: required("AWS_REGION"),
    s3Bucket: required("AWS_S3_BUCKET_NAME"),
  },
  images: {
    apiUrl: required("IMAGES_API_URL", "https://mycoffeefarm.com/api-imagenes"),
    project: required("IMAGES_PROJECT", "my-coffe-farm"),
  },
  // URLs del front usadas en los correos transaccionales.
  app: {
    // Enlace de login que se envía cuando la cuenta queda activa.
    loginUrl: process.env.APP_LOGIN_URL ?? "https://mycoffeefarm.com/login",
    // Base del enlace de activación; se le agrega `?token=...`.
    activacionUrl:
      process.env.APP_ACTIVACION_URL ??
      "https://mycoffeefarm.com/activar-cuenta",
  },
  // Correo (Mailgun, API HTTP). Opcional al arrancar: si falta la credencial,
  // el Mailer cae a un stub que solo registra en consola.
  mail: {
    mailgunApiKey: process.env.MAILGUN_API_KEY ?? "",
    mailgunDomain: process.env.MAILGUN_DOMAIN ?? "",
    // Base de la API según la región de la cuenta de Mailgun:
    //   US -> https://api.mailgun.net (por defecto)  EU -> https://api.eu.mailgun.net
    mailgunApiBase:
      process.env.MAILGUN_API_BASE ?? "https://api.mailgun.net",
    // Remitente mostrado, ej. "My Coffee Farm <no-reply@tu-dominio>".
    from: process.env.MAIL_FROM ?? "My Coffee Farm <no-reply@mycoffeefarm.com>",
  },
  // Stripe: opcional al arrancar. El gateway falla con un error claro si se usa
  // sin `secretKey`/`webhookSecret` configurados.
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    currency: process.env.STRIPE_CURRENCY ?? "cop",
    successUrl:
      process.env.STRIPE_SUCCESS_URL ?? "https://mycoffeefarm.com/pago/exito",
    cancelUrl:
      process.env.STRIPE_CANCEL_URL ?? "https://mycoffeefarm.com/pago/cancelado",
  },
};
