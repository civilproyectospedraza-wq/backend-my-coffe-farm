export interface CreateCorreoAdministrativoNotificacionInput {
  correo: string;
  estado?: boolean;
  // Opcionales para el front: si no vienen, se guardan en false.
  notificarVentasParcelas?: boolean;
  notificarSolicitudesEntregaPropietarios?: boolean;
}

export interface UpdateCorreoAdministrativoNotificacionInput {
  correo?: string;
  estado?: boolean;
  notificarVentasParcelas?: boolean;
  notificarSolicitudesEntregaPropietarios?: boolean;
}

export interface ListCorreosAdministrativosNotificacionesInput {
  page: number;
  limit: number;
  search?: string;
  estado?: boolean;
  notificarVentasParcelas?: boolean;
  notificarSolicitudesEntregaPropietarios?: boolean;
}
