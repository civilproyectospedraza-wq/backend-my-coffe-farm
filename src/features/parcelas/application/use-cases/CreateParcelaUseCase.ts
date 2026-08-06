import { BadRequestError } from "@shared/errors/AppError";
import { validarCosecha } from "../../domain/entities/CosechaParcela";
import { Parcela } from "../../domain/entities/Parcela";
import {
  ImageStorage,
  UploadImagePayload,
} from "../../domain/ports/ImageStorage";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import { CreateParcelaInput } from "../dtos/ParcelaDtos";

/**
 * Crea una parcela con su versión inicial y sus imágenes de portada
 * (`ImagenParcela`). Las imágenes se suben primero al almacenamiento y luego
 * se referencian en la parcela, en el orden recibido. Si llega `etapaId`, se
 * fija como etapa actual. Los reportes de avance son un flujo aparte.
 */
export class CreateParcelaUseCase {
  constructor(
    private readonly parcelaRepository: ParcelaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    input: CreateParcelaInput,
    imagenes: UploadImagePayload[]
  ): Promise<Parcela> {
    // La cantidad de meses debe coincidir con la temporalidad declarada.
    const errorCosecha = validarCosecha(
      input.temporalidadCosecha,
      input.mesesCosecha
    );
    if (errorCosecha) {
      throw new BadRequestError(errorCosecha);
    }

    // Las imágenes de portada son opcionales: se suben primero y luego se
    // referencian en la parcela, conservando el orden.
    const imagenLocalIds: string[] = [];
    for (const imagen of imagenes) {
      const stored = await this.imageStorage.upload({
        ...imagen,
        tipo: "parcela",
      });
      imagenLocalIds.push(stored.id);
    }

    return this.parcelaRepository.create({
      fincaId: input.fincaId,
      etapaActualId: input.etapaId ?? null,
      estado: input.estado,
      latitud: input.latitud,
      longitud: input.longitud,
      temporalidadCosecha: input.temporalidadCosecha,
      mesesCosecha: input.mesesCosecha,
      imagenLocalIds,
      version: {
        nombre: input.nombre,
        descripcion: input.descripcion,
        tarifaMetrajeId: input.tarifaMetrajeId,
        precioVentaPublico: input.precioVentaPublico,
        precioCafetero: input.precioCafetero,
      },
    });
  }
}
