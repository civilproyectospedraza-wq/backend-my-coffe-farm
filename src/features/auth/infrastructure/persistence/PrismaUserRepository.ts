import { PrismaClient, User as PrismaUser } from "@prisma/client";
import { Rol } from "../../domain/entities/Rol";
import { User } from "../../domain/entities/User";
import {
  CreateUserData,
  UserRepository,
} from "../../domain/ports/UserRepository";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { email } });
    return found ? this.toDomain(found) : null;
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.prisma.user.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const created = await this.prisma.user.create({ data });
    return this.toDomain(created);
  }

  private toDomain(record: PrismaUser): User {
    return new User({
      id: record.id,
      name: record.name,
      email: record.email,
      password: record.password,
      rol: record.rol as Rol,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
