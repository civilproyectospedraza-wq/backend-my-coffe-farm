import bcrypt from "bcryptjs";

/** Puerto/contrato de hashing de contraseñas, reutilizable entre features. */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly saltRounds = 10) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

/** Instancia compartida lista para consumir desde las features. */
export const passwordHasher: PasswordHasher = new BcryptPasswordHasher();
