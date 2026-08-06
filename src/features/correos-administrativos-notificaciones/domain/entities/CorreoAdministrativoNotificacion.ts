export interface CorreoAdministrativoNotificacionProps {
  id: string;
  correo: string;
  estado: boolean;
  notificarVentasParcelas: boolean;
  notificarSolicitudesEntregaPropietarios: boolean;
  createdAt: Date;
  deletedAt: Date | null;
}

export class CorreoAdministrativoNotificacion {
  readonly id: string;
  readonly correo: string;
  readonly estado: boolean;
  readonly notificarVentasParcelas: boolean;
  readonly notificarSolicitudesEntregaPropietarios: boolean;
  readonly createdAt: Date;
  readonly deletedAt: Date | null;

  constructor(props: CorreoAdministrativoNotificacionProps) {
    this.id = props.id;
    this.correo = props.correo;
    this.estado = props.estado;
    this.notificarVentasParcelas = props.notificarVentasParcelas;
    this.notificarSolicitudesEntregaPropietarios =
      props.notificarSolicitudesEntregaPropietarios;
    this.createdAt = props.createdAt;
    this.deletedAt = props.deletedAt;
  }
}
