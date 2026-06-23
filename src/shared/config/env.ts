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
