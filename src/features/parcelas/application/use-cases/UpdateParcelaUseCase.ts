import { BadRequestError, NotFoundError } from "@shared/errors/AppError";
import { validarCosecha } from "../../domain/entities/CosechaParcela";
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

    const hayCambios =
      Object.values(input).some((value) => value !== undefined) ||
      imagenes.length > 0;
    if (!hayCambios) {
      throw new BadRequestError(
        "Debes enviar al menos un campo para actualizar"
      );
    }

    // Cosecha: la temporalidad y los meses se validan como pareja contra el
    // estado resultante, así el front puede enviar solo uno de los dos y el
    // otro se conserva. Si solo llega uno, el faltante se toma de la parcela.
    let temporalidadCosecha: number | null | undefined;
    let mesesCosecha: number[] | undefined;
    if (
      input.temporalidadCosecha !== undefined ||
      input.mesesCosecha !== undefined
    ) {
      const temporalidadFinal =
        input.temporalidadCosecha !== undefined
          ? input.temporalidadCosecha
          : parcela.temporalidadCosecha;
      const mesesFinal =
        input.mesesCosecha !== undefined
          ? input.mesesCosecha
          : parcela.mesesCosecha;

      if (temporalidadFinal === null) {
        // Quitar la temporalidad limpia también los meses guardados.
        if (input.mesesCosecha?.length) {
          throw new BadRequestError(
            "No puedes enviar meses de cosecha sin temporalidadCosecha"
          );
        }
        temporalidadCosecha = null;
        mesesCosecha = [];
      } else {
        const errorCosecha = validarCosecha(
          temporalidadFinal,
          mesesFinal.length ? mesesFinal : undefined
        );
        if (errorCosecha) {
          throw new BadRequestError(errorCosecha);
        }

        temporalidadCosecha = temporalidadFinal;
        mesesCosecha = mesesFinal;
      }
    }

    // Las imágenes nuevas se anexan a la galería: se suben primero y luego se
    // referencian, conservando el orden recibido.
    let imagenesAgregar: string[] | undefined;
    if (imagenes.length > 0) {
      imagenesAgregar = [];
      for (const imagen of imagenes) {
        const stored = await this.imageStorage.upload({
          ...imagen,
          tipo: "parcela",
        });
        imagenesAgregar.push(stored.id);
      }
    }

    // Si cambia algún dato versionable, se generará una versión nueva.
    const hasVersionChange =
      input.nombre !== undefined ||
      input.descripcion !== undefined ||
      input.tarifaMetrajeId !== undefined ||
      input.precioVentaPublico !== undefined ||
      input.precioCafetero !== undefined;

    return this.parcelaRepository.update(id, {
      estado: input.estado,
      etapaActualId: input.etapaActualId,
      latitud: input.latitud,
      longitud: input.longitud,
      temporalidadCosecha,
      mesesCosecha,
      imagenesAgregar,
      imagenesEliminar: input.imagenesEliminar,
      version: hasVersionChange
        ? {
            nombre: input.nombre,
            descripcion: input.descripcion,
            tarifaMetrajeId: input.tarifaMetrajeId,
            precioVentaPublico: input.precioVentaPublico,
            precioCafetero: input.precioCafetero,
          }
        : undefined,
    });
  }
}
