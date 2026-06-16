import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "@shared/errors/AppError";
import { LoginUserUseCase } from "../../application/use-cases/LoginUserUseCase";
import { RegisterUserUseCase } from "../../application/use-cases/RegisterUserUseCase";
import { ValidarAuthUseCase } from "../../application/use-cases/ValidarAuthUseCase";
import { loginSchema, registerSchema } from "./validators/authSchemas";

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly validarAuthUseCase: ValidarAuthUseCase
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = registerSchema.parse(req.body);
      const result = await this.registerUserUseCase.execute(data);
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = loginSchema.parse(req.body);
      const result = await this.loginUserUseCase.execute(data);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  validarAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Token no proporcionado");
      }
      const user = await this.validarAuthUseCase.execute(req.user.id);
      return res.status(200).json({ valid: true, user });
    } catch (error) {
      return next(error);
    }
  };
}
