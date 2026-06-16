import { Rol } from "../entities/Rol";
import { User } from "../entities/User";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  rol?: Rol;
}

/** Puerto: define cómo persistimos usuarios, sin acoplarnos a Prisma. */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
