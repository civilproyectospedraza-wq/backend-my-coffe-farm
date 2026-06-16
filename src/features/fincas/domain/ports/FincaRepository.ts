import {
  PaginatedResult,
  PaginationParams,
} from "@shared/domain/pagination";
import { ResumenFinca, ResumenFincaInput } from "../../application/dtos/FincaDtos";
import { Finca } from "../entities/Finca";

export interface CreateFincaData {
  propietarioId: string;
  nombre: string;
  ubicacion: string;
  municipio: string;
  departamento: string;
  altitudMetros?: number | null;
  latitud?: number | null;
  longitud?: number | null;
  descripcion?: string | null;
  imagenId?: string | null;
}

export interface UpdateFincaData {
  nombre?: string;
  ubicacion?: string;
  municipio?: string;
  departamento?: string;
  altitudMetros?: number | null;
  latitud?: number | null;
  longitud?: number | null;
  descripcion?: string | null;
  imagenId?: string | null;
}

export interface FindFincasParams extends PaginationParams {
  /** Texto a buscar en nombre o ubicación. */
  search?: string;
}

/** Puerto: persistencia de fincas. */
export interface FincaRepository {
  create(data: CreateFincaData): Promise<Finca>;
  update(id: string, data: UpdateFincaData): Promise<Finca>;
  findById(id: string): Promise<Finca | null>;
  findMany(params: FindFincasParams): Promise<PaginatedResult<Finca>>;
  getResumen(input: ResumenFincaInput): Promise<ResumenFinca | null>;
}
