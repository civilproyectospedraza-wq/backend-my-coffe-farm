import { Prisma, PrismaClient } from "@prisma/client";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@shared/errors/AppError";
import {
  buildPaginatedResult,
  PaginatedResult,
} from "@shared/domain/pagination";
import {
  DatosComprador,
  EstadoVenta,
  TipoIdentificacion,
  Venta,
} from "../../domain/entities/Venta";
import {
  CompletarVentaData,
  CreateVentaData,
  ListVentasParams,
  VentaListItemRaw,
  VentaRepository,
} from "../../domain/ports/VentaRepository";

type VentaRecord = Prisma.VentaGetPayload<object>;
type PrismaTx = Prisma.TransactionClient;

export class PrismaVentaRepository implements VentaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateVentaData): Promise<Venta> {
    const created = await this.prisma.$transaction(async (tx) => {
      const parcela = await tx.parcela.findUnique({
        where: { id: data.parcelaId },
      });
      if (!parcela) {
        throw new NotFoundError("Parcela no encontrada");
      }
      if (!parcela.versionActualId) {
        throw new BadRequestError("La parcela no tiene una versión actual");
      }
      if (parcela.estado !== "disponible") {
        throw new ConflictError("La parcela no está disponible para la venta");
      }

      const ventaAbierta = await tx.venta.findFirst({
        where: { parcelaId: data.parcelaId, estado: "pendiente" },
      });
      if (ventaAbierta) {
        throw new ConflictError(
          "La parcela ya tiene una venta pendiente por completar"
        );
      }

      return tx.venta.create({
        data: {
          versionParcelaId: parcela.versionActualId,
          parcelaId: parcela.id,
          valor: data.valor,
          createdBy: data.createdBy ?? null,
          clienteNombre: data.comprador.nombre,
          clienteEmail: data.comprador.email,
          clienteTelefono: data.comprador.telefono,
          clienteDireccion: data.comprador.direccion,
          clienteTipoIdentificacion: data.comprador.tipoIdentificacion,
          clienteIdentificacion: data.comprador.identificacion,
        },
      });
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Venta | null> {
    const found = await this.prisma.venta.findUnique({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findMany(
    params: ListVentasParams
  ): Promise<PaginatedResult<VentaListItemRaw>> {
    const { page, limit, estado, parcelaId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.VentaWhereInput = {};
    if (estado) where.estado = estado;
    if (parcelaId) where.parcelaId = parcelaId;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.venta.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          parcela: {
            select: { id: true, versionActual: { select: { nombre: true } } },
          },
        },
      }),
      this.prisma.venta.count({ where }),
    ]);

    const data: VentaListItemRaw[] = records.map((r) => ({
      id: r.id,
      estado: r.estado as EstadoVenta,
      valor: r.valor.toNumber(),
      parcelaId: r.parcelaId,
      parcelaNombre: r.parcela.versionActual?.nombre ?? "",
      compradorNombre: r.clienteNombre,
      compradorEmail: r.clienteEmail,
      clienteId: r.clienteId,
      suscripcionId: r.suscripcionId,
      createdAt: r.createdAt,
    }));

    return buildPaginatedResult(data, total, params);
  }

  async setStripeSession(id: string, sessionId: string): Promise<void> {
    await this.prisma.venta.update({
      where: { id },
      data: { stripeSessionId: sessionId },
    });
  }

  async completar(id: string, data: CompletarVentaData): Promise<Venta> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.findUnique({ where: { id } });
      if (!venta) {
        throw new NotFoundError("Venta no encontrada");
      }
      // Idempotencia: el webhook puede reintentar. Si ya está pagada, no
      // se duplica nada (sí se registra la transacción si trae eventId nuevo).
      if (venta.estado === "pagado") {
        await this.registrarTransaccion(tx, venta.id, data);
        return venta;
      }

      const clienteId = await this.resolverCliente(tx, venta, data.passwordHash);

      const suscripcion = await tx.suscripcion.create({
        data: {
          parcelaId: venta.parcelaId,
          fechaInicio: data.fechaInicio,
          fechaFin: data.fechaFin,
          createdBy: venta.createdBy,
        },
      });

      await tx.facturacion.create({
        data: {
          ventaId: venta.id,
          clienteId,
          valor: venta.valor,
        },
      });

      await this.registrarTransaccion(tx, venta.id, data);

      const result = await tx.venta.update({
        where: { id },
        data: { estado: "pagado", clienteId, suscripcionId: suscripcion.id },
      });

      await tx.parcela.update({
        where: { id: venta.parcelaId },
        data: { estado: "ocupada" },
      });

      return result;
    });

    return this.toDomain(updated);
  }

  /**
   * Crea (o reutiliza por email) el User + Persona + Cliente para el comprador.
   * El User se crea con rol Cliente y la contraseña temporal ya hasheada.
   */
  private async resolverCliente(
    tx: PrismaTx,
    venta: VentaRecord,
    passwordHash: string
  ): Promise<string> {
    let user = await tx.user.findUnique({
      where: { email: venta.clienteEmail },
    });

    if (!user) {
      user = await tx.user.create({
        data: {
          name: venta.clienteNombre,
          email: venta.clienteEmail,
          password: passwordHash,
          rol: "Cliente",
        },
      });

      await tx.persona.create({
        data: {
          usuarioId: user.id,
          nombre: venta.clienteNombre,
          email: venta.clienteEmail,
          telefono: venta.clienteTelefono,
          direccion: venta.clienteDireccion,
          tipoIdentificacion: venta.clienteTipoIdentificacion,
          identificacion: venta.clienteIdentificacion,
        },
      });
    }

    const cliente =
      (await tx.cliente.findUnique({ where: { usuarioId: user.id } })) ??
      (await tx.cliente.create({ data: { usuarioId: user.id } }));

    return cliente.id;
  }

  /** Registra la transacción de Stripe si viene con datos (idempotente por eventId). */
  private async registrarTransaccion(
    tx: PrismaTx,
    ventaId: string,
    data: CompletarVentaData
  ): Promise<void> {
    if (!data.transaccion) {
      return;
    }
    const existente = await tx.transaccionStripe.findUnique({
      where: { eventId: data.transaccion.eventId },
    });
    if (existente) {
      return;
    }
    await tx.transaccionStripe.create({
      data: {
        ventaId,
        eventId: data.transaccion.eventId,
        sessionId: data.transaccion.sessionId,
        paymentIntentId: data.transaccion.paymentIntentId,
        monto: data.transaccion.monto,
        moneda: data.transaccion.moneda,
        estado: data.transaccion.estado,
      },
    });
  }

  private toDomain(record: VentaRecord): Venta {
    const comprador: DatosComprador = {
      nombre: record.clienteNombre,
      email: record.clienteEmail,
      telefono: record.clienteTelefono,
      direccion: record.clienteDireccion,
      tipoIdentificacion:
        record.clienteTipoIdentificacion as TipoIdentificacion | null,
      identificacion: record.clienteIdentificacion,
    };

    return new Venta({
      id: record.id,
      versionParcelaId: record.versionParcelaId,
      parcelaId: record.parcelaId,
      clienteId: record.clienteId,
      valor: record.valor.toNumber(),
      estado: record.estado as EstadoVenta,
      suscripcionId: record.suscripcionId,
      comprador,
      stripeSessionId: record.stripeSessionId,
      createdAt: record.createdAt,
      createdBy: record.createdBy,
    });
  }
}
