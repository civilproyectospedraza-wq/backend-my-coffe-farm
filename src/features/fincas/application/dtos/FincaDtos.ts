export interface CreateFincaInput {
  propietarioId: string;
  nombre: string;
  ubicacion: string;
  municipio: string;
  departamento: string;
  altitudMetros?: number | null;
  latitud?: number | null;
  longitud?: number | null;
  descripcion?: string | null;
}

export interface UpdateFincaInput {
  nombre?: string;
  ubicacion?: string;
  municipio?: string;
  departamento?: string;
  altitudMetros?: number | null;
  latitud?: number | null;
  longitud?: number | null;
  descripcion?: string | null;
}

export interface ListFincasInput {
  page: number;
  limit: number;
}

export interface BuscarFincasInput {
  page: number;
  limit: number;
  search: string;
}

export interface ResumenFincaInput {
  fincaId: string;
  fechaInicio: Date;
  fechaFin: Date;
}

export interface ResumenFinca {
  finca: {
    id: string;
    nombre: string;
    ubicacion: string;
    municipio: string;
    departamento: string;
    altitudMetros: number | null;
    latitud: number | null;
    longitud: number | null;
    descripcion: string | null;
    imagenId: string | null;
    imagenUrl: string | null;
    createdAt: Date;
  };
  propietario: {
    id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    identificacion: string | null;
  };
  periodo: {
    fechaInicio: Date;
    fechaFin: Date;
  };
  parcelas: {
    total: number;
    porEstado: {
      disponible: number;
      ocupada: number;
    };
    detalle: Array<{
      id: string;
      estado: string;
      etapaActual: string | null;
      nombre: string | null;
      areaHectareas: number | null;
      precioAlquiler: number | null;
    }>;
  };
  alquileres: {
    total: number;
    porEstado: {
      pendiente: number;
      pagado: number;
    };
    rentabilidad: number;
  };
}
