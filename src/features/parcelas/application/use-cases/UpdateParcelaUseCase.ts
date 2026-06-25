import { BadRequestError, NotFoundError } from "@shared/errors/AppError";
import { Parcela } from "../../domain/entities/Parcela";
import {
  ImageStorage,
  UploadImagePayload,
} from "../../domain/ports/ImageStorage";
import { ParcelaRepository } from "../../domain/ports/ParcelaRepository";
import { UpdateParcelaInput } from "../dtos/ParcelaDtos";

export class UpdateParcelaUseCase {
  constructor(
    private readonly parcelaRepository: ParcelaRepository,
    private readonly imageStorage: ImageStorage
  ) {}

  async execute(
    id: string,
    input: UpdateParcelaInput,
    imagenes: UploadImagePayload[]
  ): Promise<Parcela> {
    const parcela = await this.parcelaRepository.findById(id);
    if (!parcela) {
      throw new NotFoundError("Parcela no encontrada");
    }

    const tieneCampos = Object.keys(input).length > 0;
    if (!tieneCampos && imagenes.length === 0) {
      throw new BadRequestError(
        "Debes enviar al menos un campo para actualizar"
      );
    }

    // Si llegan imágenes, reemplazan la portada de la parcela. Se suben
    // primero y luego se referencian, conservando el orden recibido.
    let imagenLocalIds: string[] | undefined;
    if (imagenes.length > 0) {
      imagenLocalIds = [];
      for (const imagen of imagenes) {
        const stored = await this.imageStorage.upload({
          ...imagen,
          tipo: "parcela",
        });
        imagenLocalIds.push(stored.id);
      }
    }

    // Si cambia algún dato versionable, se generará una versión nueva.
    const hasVersionChange =
      input.nombre !== undefined ||
      input.descripcion !== undefined ||
      input.areaMetrosCuadrados !== undefined ||
      input.precioAlquiler !== undefined;

    return this.parcelaRepository.update(id, {
      estado: input.estado,
      etapaActualId: input.etapaActualId,
      latitud: input.latitud,
      longitud: input.longitud,
      imagenLocalIds,
      version: hasVersionChange
        ? {
            nombre: input.nombre,
            descripcion: input.descripcion,
            areaMetrosCuadrados: input.areaMetrosCuadrados,
            precioAlquiler: input.precioAlquiler,
          }
        : undefined,
    });
  }
}
