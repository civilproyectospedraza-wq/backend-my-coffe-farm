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
 * Aviso interno a los correos administrativos cuando un propietario crea una
 * solicitud de entrega. `destinatarios` ya viene filtrado por la bandera
 * `notificarSolicitudesEntregaPropietarios`.
 */
export interface SolicitudEntregaParcelaMail {
  destinatarios: string[];
  solicitudId: string;
  propietarioNombre: string;
  fincaNombre: string;
  parcelaNombre: string;
  cantidadKg: number;
  fecha: Date;
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
  /** Aviso interno de una nueva solicitud de entrega hecha por un propietario. */
  enviarSolicitudEntregaParcela(
    mail: SolicitudEntregaParcelaMail
  ): Promise<void>;
}

/** Formatea la cantidad en kilos con separadores de miles en español. */
function formatearKg(cantidadKg: number): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cantidadKg);
}

/** Fecha legible (día, mes, año y hora) para el cuerpo de los correos. */
function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(fecha);
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
//
// Los correos usan tablas + estilos inline (no flexbox/CSS externo): es la única
// forma de que se rendericen centrados e iguales en Gmail, Outlook, Apple Mail,
// etc. La paleta sigue la marca (marrón café + dorado sobre crema).

const COLOR = {
  cafe: "#5b3a1a", // marrón principal
  dorado: "#c08a2d", // acento
  crema: "#f4f1ea", // fondo exterior
  texto: "#2d2a26",
  suave: "#6f6a63", // texto secundario
  borde: "#e7e1d6",
};

function logoHtml(): string {
  return LOGO
    ? `<img src="cid:${LOGO_CID}" alt="My Coffee Farm" width="96" height="96" style="display:block; width:96px; height:96px; margin:0 auto 12px; border-radius:50%;" />`
    : "";
}

/**
 * Marco común de todos los correos: card blanca centrada (600px) sobre fondo
 * crema, con cabecera de marca y pie. El `cuerpo` ya viene con su HTML interno.
 * `preheader` es el texto de vista previa que muestran los clientes de correo.
 */
function layout(titulo: string, cuerpo: string, preheader: string): string {
  return `<!-- preheader --><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.crema}; margin:0; padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#ffffff; border:1px solid ${COLOR.borde}; border-radius:14px; overflow:hidden; font-family:Arial,Helvetica,sans-serif;">
        <!-- Cabecera de marca -->
        <tr>
          <td align="center" style="background:${COLOR.cafe}; padding:28px 24px 22px;">
            ${logoHtml()}
            <div style="color:#f7efe2; font-size:13px; letter-spacing:3px; text-transform:uppercase;">My Coffee Farm</div>
          </td>
        </tr>
        <!-- Barra dorada -->
        <tr><td style="height:4px; background:${COLOR.dorado}; font-size:0; line-height:0;">&nbsp;</td></tr>
        <!-- Contenido -->
        <tr>
          <td align="center" style="padding:36px 40px 32px; color:${COLOR.texto};">
            <h1 style="margin:0 0 18px; font-size:23px; line-height:1.3; color:${COLOR.cafe};">${titulo}</h1>
            ${cuerpo}
          </td>
        </tr>
        <!-- Pie -->
        <tr>
          <td align="center" style="background:${COLOR.crema}; padding:22px 40px; border-top:1px solid ${COLOR.borde};">
            <div style="font-size:12px; color:${COLOR.suave}; line-height:1.6;">
              Cultiva hoy, cosecha mañana &middot; <strong style="color:${COLOR.cafe};">My Coffee Farm</strong><br />
              Este es un correo automático, por favor no respondas a este mensaje.
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

/** Botón "bulletproof" (tabla) para que también se vea bien en Outlook. */
function boton(texto: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto 20px;">
    <tr>
      <td align="center" style="border-radius:8px; background:${COLOR.cafe};">
        <a href="${url}" style="display:inline-block; padding:15px 34px; font-size:16px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px;">${texto}</a>
      </td>
    </tr>
  </table>
  <p style="margin:0; font-size:12px; color:${COLOR.suave}; line-height:1.6;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
    <a href="${url}" style="color:${COLOR.dorado}; word-break:break-all;">${url}</a>
  </p>`;
}

/** Párrafo centrado con el estilo de cuerpo estándar. */
function parrafo(texto: string): string {
  return `<p style="margin:0 0 16px; font-size:15px; line-height:1.65; color:${COLOR.texto};">${texto}</p>`;
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
      `${parrafo(
        "Tu cuenta de caficultor fue <strong>aprobada</strong>. Ya puedes iniciar sesión con estos datos:"
      )}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
         <tr><td style="padding:16px 20px; background:${COLOR.crema}; border-radius:10px; text-align:left;">
           <div style="font-size:14px; color:${COLOR.texto}; line-height:1.9;">
             <strong>Usuario:</strong> ${mail.email}<br />
             <strong>Contraseña:</strong> ${mail.passwordAcceso}
           </div>
         </td></tr>
       </table>
       ${parrafo(
         `<span style="font-size:13px; color:${COLOR.suave};">Por seguridad, te recomendamos cambiar tu contraseña al ingresar.</span>`
       )}`,
      "Tu cuenta de caficultor fue aprobada. Ya puedes iniciar sesión."
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
      `¡Bienvenido a My Coffee Farm, ${mail.nombre}!`,
      `${parrafo(
        "Nos alegra tenerte. Estás a un paso de comenzar a <strong>alquilar tu finca cafetera</strong> y convertir tu tierra en una nueva fuente de ingresos."
      )}
       ${parrafo(
         "Solo falta <strong>activar tu cuenta</strong> y definir tu contraseña. Es rápido y seguro:"
       )}
       ${boton("Activar mi cuenta", mail.enlaceActivacion)}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;">
         <tr><td style="padding:16px 20px; background:${COLOR.crema}; border-radius:10px; text-align:left;">
           <div style="font-size:13px; color:${COLOR.suave}; line-height:1.7;">
             ✔ Publica tu finca y recibe solicitudes de alquiler.<br />
             ✔ Tú defines la disponibilidad y las condiciones.<br />
             ✔ Acompañamiento en todo el proceso.
           </div>
         </td></tr>
       </table>
       ${parrafo(
         `<span style="font-size:13px; color:${COLOR.suave};">Este enlace de activación es personal. Si no creaste esta cuenta, puedes ignorar este correo.</span>`
       )}`,
      "Activa tu cuenta y empieza a alquilar tu finca en My Coffee Farm."
    );
    const text =
      `¡Bienvenido a My Coffee Farm, ${mail.nombre}!\n\n` +
      `Estás a un paso de comenzar a alquilar tu finca cafetera y convertir tu tierra en una nueva fuente de ingresos.\n\n` +
      `Solo falta activar tu cuenta y definir tu contraseña en este enlace:\n` +
      `${mail.enlaceActivacion}\n\n` +
      `Este enlace es personal. Si no creaste esta cuenta, ignora este mensaje.\n\n` +
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
      `¡Tu cuenta ya está activa, ${mail.nombre}!`,
      `${parrafo(
        "Tu cuenta de My Coffee Farm quedó <strong>activada</strong>. Ya puedes publicar tu finca y empezar a recibir solicitudes de alquiler."
      )}
       ${parrafo("Ingresa cuando quieras desde aquí:")}
       ${boton("Iniciar sesión", mail.enlaceLogin)}`,
      "Tu cuenta ya está activa en My Coffee Farm. ¡Ingresa cuando quieras!"
    );
    const text =
      `¡Tu cuenta está activa, ${mail.nombre}!\n\n` +
      `Tu cuenta de My Coffee Farm ya está activa.\n` +
      `Ingresa desde: ${mail.enlaceLogin}\n\n` +
      `My Coffee Farm`;
    await this.send(mail.email, "Tu cuenta ya está activa", html, text);
  }

  async enviarSolicitudEntregaParcela(
    mail: SolicitudEntregaParcelaMail
  ): Promise<void> {
    if (mail.destinatarios.length === 0) {
      return;
    }

    const kg = formatearKg(mail.cantidadKg);
    const fecha = formatearFecha(mail.fecha);

    const html = layout(
      "Nueva solicitud de entrega",
      `${parrafo(
        `El propietario <strong>${mail.propietarioNombre}</strong> registró una solicitud de entrega de café.`
      )}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
         <tr><td style="padding:16px 20px; background:${COLOR.crema}; border-radius:10px; text-align:left;">
           <div style="font-size:14px; color:${COLOR.texto}; line-height:1.9;">
             <strong>Finca:</strong> ${mail.fincaNombre}<br />
             <strong>Parcela:</strong> ${mail.parcelaNombre}<br />
             <strong>Cantidad solicitada:</strong> ${kg} kg<br />
             <strong>Fecha:</strong> ${fecha}<br />
             <strong>Solicitud:</strong> ${mail.solicitudId}
           </div>
         </td></tr>
       </table>
       ${parrafo(
         `<span style="font-size:13px; color:${COLOR.suave};">La solicitud queda en estado <strong>pendiente</strong> hasta que sea gestionada.</span>`
       )}`,
      `${mail.propietarioNombre} solicitó una entrega de ${kg} kg.`
    );
    const text =
      `Nueva solicitud de entrega\n\n` +
      `Propietario: ${mail.propietarioNombre}\n` +
      `Finca: ${mail.fincaNombre}\n` +
      `Parcela: ${mail.parcelaNombre}\n` +
      `Cantidad solicitada: ${kg} kg\n` +
      `Fecha: ${fecha}\n` +
      `Solicitud: ${mail.solicitudId}\n\n` +
      `La solicitud queda en estado pendiente hasta que sea gestionada.\n\n` +
      `My Coffee Farm`;

    // Un solo envío con todos los destinatarios: son correos internos de la
    // misma organización, así que verse entre sí no es un problema.
    await this.send(
      mail.destinatarios.join(", "),
      "Nueva solicitud de entrega de un propietario",
      html,
      text
    );
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

  async enviarSolicitudEntregaParcela(
    mail: SolicitudEntregaParcelaMail
  ): Promise<void> {
    console.log(
      `📧 [Mailer stub] Solicitud de entrega ${mail.solicitudId} de ` +
        `${mail.propietarioNombre} (${mail.fincaNombre} / ${mail.parcelaNombre}, ` +
        `${formatearKg(mail.cantidadKg)} kg) → ${mail.destinatarios.join(", ")}`
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
