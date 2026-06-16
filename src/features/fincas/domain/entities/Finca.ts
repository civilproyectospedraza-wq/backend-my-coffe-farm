export interface FincaProps {
  id: string;
  propietarioId: string;
  imagenId: string | null;
  nombre: string;
  ubicacion: string;
  municipio: string;
  departamento: string;
  altitudMetros: number | null;
  latitud: number | null;
  longitud: number | null;
  descripcion: string | null;
  createdAt: Date;
}

export class Finca {
  readonly id: string;
  readonly propietarioId: string;
  readonly imagenId: string | null;
  readonly nombre: string;
  readonly ubicacion: string;
  readonly municipio: string;
  readonly departamento: string;
  readonly altitudMetros: number | null;
  readonly latitud: number | null;
  readonly longitud: number | null;
  readonly descripcion: string | null;
  readonly createdAt: Date;

  constructor(props: FincaProps) {
    this.id = props.id;
    this.propietarioId = props.propietarioId;
    this.imagenId = props.imagenId;
    this.nombre = props.nombre;
    this.ubicacion = props.ubicacion;
    this.municipio = props.municipio;
    this.departamento = props.departamento;
    this.altitudMetros = props.altitudMetros;
    this.latitud = props.latitud;
    this.longitud = props.longitud;
    this.descripcion = props.descripcion;
    this.createdAt = props.createdAt;
  }
}
