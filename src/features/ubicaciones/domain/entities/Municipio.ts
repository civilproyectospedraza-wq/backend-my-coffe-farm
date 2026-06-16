export interface MunicipioProps {
  id: number;
  nombre: string;
  departamentoId: number;
  departamentoNombre: string;
}

export class Municipio {
  readonly id: number;
  readonly nombre: string;
  readonly departamentoId: number;
  readonly departamentoNombre: string;

  constructor(props: MunicipioProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.departamentoId = props.departamentoId;
    this.departamentoNombre = props.departamentoNombre;
  }
}
