import { EstadoParcela } from "../../domain/entities/EstadoParcela";
import { ParcelaProps } from "../../domain/entities/Parcela";

export interface CreateParcelaInput {
  fincaId: string;
  nombre: string;
  descripcion?: string | null;
  tarifaMetrajeId?: string | null;
  precioVentaPublico: number;
  precioCafetero: number;
  estado?: EstadoParcela;
  latitud?: number | null;
  longitud?: number | null;
  // Si llega `etapaId`, fija la etapa actual de la parcela; de lo contrario la
  // parcela se crea sin etapa. Los reportes de avance son un flujo aparte.
  etapaId?: string;
}

export interface UpdateParcelaInput {
  nombre?: string;
  descripcion?: string | null;
  tarifaMetrajeId?: string | null;
  precioVentaPublico?: number;
  precioCafetero?: number;
  etapaActualId?: string | null;
  estado?: EstadoParcela;
  latitud?: number | null;
  longitud?: number | null;
  // imagenLocalId de las imágenes a eliminar de la galería.
  imagenesEliminar?: string[];
}

// Imagen de la galería con su URL pública resuelta, lista para mostrar en el
// front. Se conserva `imagenLocalId` porque es el valor que espera
// `imagenesEliminar` al actualizar.
export interface ParcelaImagenView {
  imagenLocalId: string;
  url: string;
  orden: number;
}

// Detalle de parcela para el panel admin: la entidad con las URLs de sus
// imágenes resueltas.
export interface ParcelaDetailView extends Omit<ParcelaProps, "imagenes"> {
  imagenes: ParcelaImagenView[];
}

export interface ListParcelasInput {
  page: number;
  limit: number;
  fincaId?: string;
  estado?: EstadoParcela;
  // Si viene, solo las parcelas cuyas fincas pertenecen a ese propietario.
  propietarioId?: string;
}
