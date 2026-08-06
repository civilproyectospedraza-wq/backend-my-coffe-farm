import { ForbiddenError, NotFoundError } from "@shared/errors/AppError";
import { Mailer } from "@shared/services/mail/Mailer";
import { SolicitudEntregaParcela } from "../../domain/entities/SolicitudEntregaParcela";
import { DestinatariosNotificacionRepository } from "../../domain/ports/DestinatariosNotificacionRepository";
import {
  ParcelaSolicitudContexto,
  SolicitudEntregaParcelaRepository,
} from "../../domain/ports/SolicitudEntregaParcelaRepository";
import {
  CreateSolicitudEntregaParcelaInput,
  SolicitudEntregaParcelaResponse,
} from "../dtos/SolicitudEntregaParcelaDtos";

/**
 * Un propietario solicita una entrega de café sobre una de sus parcelas. La
 * solicitud nace en estado `pendiente` y se avisa por correo a los
 * administrativos suscritos a este tipo de notificación.
 */
export class CreateSolicitudEntregaParcelaUseCase {
  constructor(
    private readonly solicitudRepository: SolicitudEntregaParcelaRepository,
    private readonly destinatariosRepository: DestinatariosNotificacionRepository,
    private readonly mailer: Mailer
  ) {}

  async execute(
    input: CreateSolicitudEntregaParcelaInput
  ): Promise<SolicitudEntregaParcelaResponse> {
    const contexto = await this.solicitudRepository.findParcelaContexto(
      input.parcelaId
    );
    if (!contexto) {
      throw new NotFoundError("Parcela no encontrada");
    }

    // La parcela tiene que ser de una finca del propietario autenticado.
    if (contexto.propietarioId !== input.propietarioId) {
      throw new ForbiddenError(
        "No puedes solicitar entregas sobre una parcela que no es tuya"
      );
    }

    // El estimado se calcula en el backend con la tarifa vigente de la parcela
    // (no se acepta del cliente) y queda congelado en la solicitud.
    const valor =
      contexto.valorPropietarioPorKg !== null
        ? Math.round(contexto.valorPropietarioPorKg * input.cantidadKg * 100) /
          100
        : null;

    const solicitud = await this.solicitudRepository.create({
      parcelaId: input.parcelaId,
      cantidadKg: input.cantidadKg,
      tarifaVersionId: contexto.tarifaVersionId,
      valor,
    });

    await this.notificarAdministrativos(solicitud, contexto);

    return {
      id: solicitud.id,
      parcelaId: solicitud.parcelaId,
      cantidadKg: solicitud.cantidadKg,
      tarifaVersionId: solicitud.tarifaVersionId,
      valor: solicitud.valor,
      estado: solicitud.estado,
      createdAt: solicitud.createdAt.toISOString(),
    };
  }

  /**
   * El aviso nunca debe tumbar la solicitud: si no hay destinatarios o el envío
   * falla, se registra y la solicitud queda creada igual.
   */
  private async notificarAdministrativos(
    solicitud: SolicitudEntregaParcela,
    contexto: ParcelaSolicitudContexto
  ): Promise<void> {
    try {
      const destinatarios =
        await this.destinatariosRepository.findCorreosSolicitudesEntrega();

      if (destinatarios.length === 0) {
        console.warn(
          `No hay correos administrativos suscritos a solicitudes de entrega; ` +
            `la solicitud ${solicitud.id} se creó sin notificar.`
        );
        return;
      }

      await this.mailer.enviarSolicitudEntregaParcela({
        destinatarios,
        solicitudId: solicitud.id,
        propietarioNombre: contexto.propietarioNombre,
        fincaNombre: contexto.fincaNombre,
        parcelaNombre: contexto.parcelaNombre ?? "Sin nombre",
        cantidadKg: solicitud.cantidadKg,
        fecha: solicitud.createdAt,
      });
    } catch (error) {
      console.error(
        `No se pudo notificar la solicitud de entrega ${solicitud.id}:`,
        error
      );
    }
  }
}
