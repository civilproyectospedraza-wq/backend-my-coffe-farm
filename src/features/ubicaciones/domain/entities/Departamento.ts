export interface DepartamentoProps {
  id: number;
  nombre: string;
}

export class Departamento {
  readonly id: number;
  readonly nombre: string;

  constructor(props: DepartamentoProps) {
    this.id = props.id;
    this.nombre = props.nombre;
  }
}
