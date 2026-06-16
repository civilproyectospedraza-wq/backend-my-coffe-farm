import multer from "multer";
import { BadRequestError } from "@shared/errors/AppError";

/**
 * Middleware compartido para recibir archivos en `multipart/form-data`.
 * Usa almacenamiento en memoria porque el buffer se reenvía directamente a
 * S3 (ver `S3Service.upload`), sin tocar el disco del servidor.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new BadRequestError("El archivo debe ser una imagen"));
    }
  },
});

/** Recibe una única imagen enviada en el campo `imagen`. */
export const uploadImagen = upload.single("imagen");

/** Recibe varias imágenes (hasta 10) enviadas en el campo `imagenes`. */
export const uploadImagenes = upload.array("imagenes", 10);
