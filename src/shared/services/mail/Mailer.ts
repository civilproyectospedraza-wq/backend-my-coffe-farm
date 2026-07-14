import { readFileSync } from "node:fs";
import path from "node:path";
import { env } from "@shared/config/env";

/** Datos del correo de bienvenida enviado a un caficultor recién aprobado. */
export interface BienvenidaCaficultorMail {
  nombre: string;
  email: string;
  // Contraseña en claro con la que podrá iniciar sesión (su número de documento).
  passwordAcceso: string;
}

/** Correo de agradecimiento + enlace de activación del registro público. */
export interface ActivacionPropietarioMail {
  nombre: string;
  email: string;
  // Enlace del front donde el propietario confirma la cuenta y define su contraseña.
  enlaceActivacion: string;
}

/** Correo de confirmación cuando la cuenta ya quedó activa. */
export interface CuentaActivadaMail {
  nombre: string;
  email: string;
  // Enlace de login del front.
  enlaceLogin: string;
}

/**
 * Puerto/contrato de envío de correos, reutilizable entre features.
 * La implementación concreta (Mailgun, SES, etc.) se inyecta desde el módulo.
 */
export interface Mailer {
  enviarBienvenidaCaficultor(mail: BienvenidaCaficultorMail): Promise<void>;
  /** Registro público: agradece y envía el enlace de activación. */
  enviarActivacionPropietario(mail: ActivacionPropietarioMail): Promise<void>;
  /** Activación: confirma que la cuenta ya está activa con el enlace de login. */
  enviarCuentaActivada(mail: CuentaActivadaMail): Promise<void>;
}

// ---- Logo embebido (inline vía CID) ----

const LOGO_CID = "logo.jpeg";

// Se lee una vez al cargar el módulo. Si no se encuentra, los correos se envían
// sin logo (nunca se rompe el envío por esto). Se guarda como Uint8Array para
// usarlo directamente como parte de un Blob.
const LOGO: Uint8Array | null = (() => {
  try {
    const ruta =
      process.env.MAIL_LOGO_PATH ??
      path.join(process.cwd(), "src", "public", "logo.jpeg");
    return Uint8Array.from(readFileSync(ruta));
  } catch {
    console.warn("⚠️  Logo de correo no encontrado; se enviará sin logo.");
    return null;
  }
})();

// ---- Plantillas HTML compartidas ----

function logoHtml(): string {
  return LOGO
    ? `<div style="text-align: center; margin-bottom: 20px;">
         <img src="cid:${LOGO_CID}" alt="My Coffee Farm" style="max-width: 150px; height: auto;" />
       </div>`
    : "";
}

function layout(titulo: string, cuerpo: string): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #2d2a26;">
    ${logoHtml()}
    <h2 style="color: #5b3a1a;">${titulo}</h2>
    ${cuerpo}
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
    <p style="font-size: 12px; color: #999;">My Coffee Farm</p>
  </div>`;
}

function boton(texto: string, url: string): string {
  return `<p style="margin: 24px 0;">
    <a href="${url}" style="background: #5b3a1a; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 6px; display: inline-block;">${texto}</a>
  </p>
  <p style="font-size: 13px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
    <a href="${url}">${url}</a>
  </p>`;
}

/**
 * Implementación real con la API HTTP de Mailgun (sin SDK: usa `fetch`).
 * Envía multipart para poder adjuntar el logo inline (CID) y siempre incluye
 * una versión en texto plano (mejora la entregabilidad). Se usa cuando hay
 * `MAILGUN_API_KEY` y `MAILGUN_DOMAIN`; si falla, propaga el error para que el
 * use case lo registre sin romper la operación de negocio.
 */
export class MailgunMailer implements Mailer {
  private readonly domain: string;
  private readonly apiBase: string;

  constructor(
    private readonly apiKey: string,
    domain: string,
    private readonly from: string,
    // Base de la API según la región de la cuenta:
    //   US -> https://api.mailgun.net   EU -> https://api.eu.mailgun.net
    apiBase: string
  ) {
    // El dominio debe ir pelado (ej. "mg.midominio.com"): se le quita cualquier
    // esquema http(s)://, barras y espacios para evitar rutas inválidas (404).
    this.domain = domain
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");
    this.apiBase = apiBase.trim().replace(/\/+$/, "");
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<void> {
    const auth = Buffer.from(`api:${this.apiKey}`).toString("base64");

    const form = new FormData();
    form.append("from", this.from);
    form.append("to", to);
    form.append("subject", subject);
    form.append("html", html);
    form.append("text", text);
    if (LOGO) {
      // `inline` + filename => se referencia en el HTML como cid:logo.jpeg.
      // Cast por la fricción TS 5.9 entre Uint8Array<ArrayBufferLike> y BlobPart.
      form.append(
        "inline",
        new Blob([LOGO as unknown as BlobPart], { type: "image/jpeg" }),
        LOGO_CID
      );
    }

    // Sin Content-Type manual: fetch fija el boundary del multipart.
    const res = await fetch(`${this.apiBase}/v3/${this.domain}/messages`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: form,
    });

    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      throw new Error(`Mailgun respondió ${res.status}: ${detalle}`);
    }
  }

  async enviarBienvenidaCaficultor(
    mail: BienvenidaCaficultorMail
  ): Promise<void> {
    const html = layout(
      `¡Bienvenido, ${mail.nombre}!`,
      `<p>Tu cuenta de caficultor fue aprobada. Ya puedes iniciar sesión con:</p>
       <p><strong>Usuario:</strong> ${mail.email}<br />
          <strong>Contraseña:</strong> ${mail.passwordAcceso}</p>`
    );
    const text =
      `¡Bienvenido, ${mail.nombre}!\n\n` +
      `Tu cuenta de caficultor fue aprobada. Inicia sesión con:\n` +
      `Usuario: ${mail.email}\nContraseña: ${mail.passwordAcceso}\n\n` +
      `My Coffee Farm`;
    await this.send(mail.email, "Bienvenido a My Coffee Farm", html, text);
  }

  async enviarActivacionPropietario(
    mail: ActivacionPropietarioMail
  ): Promise<void> {
    const html = layout(
      `¡Gracias por registrarte, ${mail.nombre}!`,
      `<p>Gracias por registrarte con nosotros en My Coffee Farm.</p>
       <p>Para terminar, activa tu cuenta y define tu contraseña desde el siguiente enlace:</p>
       ${boton("Activar mi cuenta", mail.enlaceActivacion)}`
    );
    const text =
      `¡Gracias por registrarte, ${mail.nombre}!\n\n` +
      `Gracias por registrarte con nosotros en My Coffee Farm.\n` +
      `Para terminar, activa tu cuenta y define tu contraseña en este enlace:\n` +
      `${mail.enlaceActivacion}\n\n` +
      `My Coffee Farm`;
    await this.send(
      mail.email,
      "Activa tu cuenta en My Coffee Farm",
      html,
      text
    );
  }

  async enviarCuentaActivada(mail: CuentaActivadaMail): Promise<void> {
    const html = layout(
      `¡Tu cuenta está activa, ${mail.nombre}!`,
      `<p>Tu cuenta de My Coffee Farm ya está activa.</p>
       <p>Ingresa cuando quieras desde:</p>
       ${boton("Iniciar sesión", mail.enlaceLogin)}`
    );
    const text =
      `¡Tu cuenta está activa, ${mail.nombre}!\n\n` +
      `Tu cuenta de My Coffee Farm ya está activa.\n` +
      `Ingresa desde: ${mail.enlaceLogin}\n\n` +
      `My Coffee Farm`;
    await this.send(mail.email, "Tu cuenta ya está activa", html, text);
  }
}

/**
 * Stub de respaldo: NO envía correo, solo registra en consola. Se usa cuando no
 * hay credenciales configuradas (desarrollo local).
 */
export class LogMailer implements Mailer {
  async enviarBienvenidaCaficultor(
    mail: BienvenidaCaficultorMail
  ): Promise<void> {
    console.log(
      `📧 [Mailer stub] Bienvenida a ${mail.nombre} <${mail.email}> — ` +
        `usuario: ${mail.email}, contraseña: ${mail.passwordAcceso}`
    );
  }

  async enviarActivacionPropietario(
    mail: ActivacionPropietarioMail
  ): Promise<void> {
    console.log(
      `📧 [Mailer stub] Activación a ${mail.nombre} <${mail.email}> — ` +
        `enlace: ${mail.enlaceActivacion}`
    );
  }

  async enviarCuentaActivada(mail: CuentaActivadaMail): Promise<void> {
    console.log(
      `📧 [Mailer stub] Cuenta activa de ${mail.nombre} <${mail.email}> — ` +
        `login: ${mail.enlaceLogin}`
    );
  }
}

/**
 * Instancia compartida: usa Mailgun si hay credenciales; si no, cae al stub que
 * solo registra en consola. Así el arranque nunca falla por falta de config.
 */
export const mailer: Mailer =
  env.mail.mailgunApiKey && env.mail.mailgunDomain
    ? new MailgunMailer(
        env.mail.mailgunApiKey,
        env.mail.mailgunDomain,
        env.mail.from,
        env.mail.mailgunApiBase
      )
    : new LogMailer();
