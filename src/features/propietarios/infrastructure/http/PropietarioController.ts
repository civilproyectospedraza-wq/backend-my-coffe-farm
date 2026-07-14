import { NextFunction, Request, Response } from "express";
import { ActivarPropietarioUseCase } from "../../application/use-cases/ActivarPropietarioUseCase";
import { CreatePropietarioUseCase } from "../../application/use-cases/CreatePropietarioUseCase";
import { ListPropietariosUseCase } from "../../application/use-cases/ListPropietariosUseCase";
import { RegistrarPropietarioUseCase } from "../../application/use-cases/RegistrarPropietarioUseCase";
import {
  activarPropietarioSchema,
  createPropietarioSchema,
  listPropietariosSchema,
  registrarPropietarioSchema,
} from "./validators/propietarioSchemas";

export class PropietarioController {
  constructor(
    private readonly createPropietarioUseCase: CreatePropietarioUseCase,
    private readonly listPropietariosUseCase: ListPropietariosUseCase,
    private readonly registrarPropietarioUseCase: RegistrarPropietarioUseCase,
    private readonly activarPropietarioUseCase: ActivarPropietarioUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createPropietarioSchema.parse(req.body);
      const propietario = await this.createPropietarioUseCase.execute(data);
      return res.status(201).json(propietario);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = listPropietariosSchema.parse(req.query);
      const result = await this.listPropietariosUseCase.execute(params);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  // Público: el propietario se registra desde la landing (queda `pendiente`).
  registrar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registrarPropietarioSchema.parse(req.body);
      const propietario = await this.registrarPropietarioUseCase.execute(data);
      return res.status(201).json(propietario);
    } catch (error) {
      return next(error);
    }
  };

  // Público: el propietario activa su cuenta con el token del correo y define
  // su contraseña (se crea el usuario rol Propietario).
  activar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = activarPropietarioSchema.parse(req.body);
      const propietario = await this.activarPropietarioUseCase.execute(data);
      return res.status(200).json(propietario);
    } catch (error) {
      return next(error);
    }
  };
}
