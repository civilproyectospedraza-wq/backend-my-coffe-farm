import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { AppError } from "@shared/errors/AppError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "La imagen supera el tamaño máximo permitido (5 MB)"
        : `Error al subir el archivo: ${err.message}`;
    return res.status(400).json({ message });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      message: "Error de validación",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res
          .status(409)
          .json({ message: "Ya existe un registro con esos datos únicos" });
      case "P2003":
        return res.status(400).json({
          message: "Referencia inválida: el recurso relacionado no existe",
        });
      case "P2025":
        return res.status(404).json({ message: "Recurso no encontrado" });
    }
  }

  console.error("[ErrorHandler] Error inesperado:", err);
  return res.status(500).json({ message: "Error interno del servidor" });
}
