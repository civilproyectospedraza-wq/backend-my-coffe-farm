/**
 * Puerto: a quién se le avisa por correo cuando entra una solicitud de entrega.
 * La feature declara lo único que necesita de `correos_administrativos_
 * notificaciones` y no depende del resto de ese módulo.
 */
export interface DestinatariosNotificacionRepository {
  /**
   * Correos habilitados para recibir el aviso: activos, no borrados
   * lógicamente y con `notificarSolicitudesEntregaPropietarios` en true.
   */
  findCorreosSolicitudesEntrega(): Promise<string[]>;
}
