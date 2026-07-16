import { Prisma, PrismaClient } from "@prisma/client";
import {
  DashboardAggregates,
  DashboardRepository,
  DashboardScope,
} from "../../domain/ports/DashboardRepository";

export class PrismaDashboardRepository implements DashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getResumen({ propietarioId }: DashboardScope): Promise<DashboardAggregates> {
    // Filtros de scope: undefined => global (Admin); con id => ese propietario,
    // navegando la relación de cada recurso hasta la finca dueña.
    const fincaWhere: Prisma.FincaWhereInput = propietarioId
      ? { propietarioId }
      : {};
    const parcelaWhere: Prisma.ParcelaWhereInput = propietarioId
      ? { finca: { propietarioId } }
      : {};
    const entregaWhere: Prisma.EntregaParcelaSuscripcionWhereInput = propietarioId
      ? { suscripcion: { parcela: { finca: { propietarioId } } } }
      : {};

    // Todo en BD: COUNT de fincas, COUNT de parcelas por estado, COUNT+SUM de
    // entregas y las 5 más recientes. Sin traer filas a memoria para agregar.
    const [
      fincasTotal,
      parcelasOcupadas,
      parcelasDisponibles,
      entregasAgg,
      entregasRecientes,
    ] = await this.prisma.$transaction([
      this.prisma.finca.count({ where: fincaWhere }),
      this.prisma.parcela.count({
        where: { ...parcelaWhere, estado: "ocupada" },
      }),
      this.prisma.parcela.count({
        where: { ...parcelaWhere, estado: "disponible" },
      }),
      this.prisma.entregaParcelaSuscripcion.aggregate({
        where: entregaWhere,
        _count: { _all: true },
        _sum: { cantidadEntregada: true, valorPagado: true },
      }),
      this.prisma.entregaParcelaSuscripcion.findMany({
        where: entregaWhere,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      fincasTotal,
      parcelasOcupadas,
      parcelasDisponibles,
      entregasTotal: entregasAgg._count._all,
      totalCantidadEntregada:
        entregasAgg._sum.cantidadEntregada?.toNumber() ?? 0,
      totalValorPagado: entregasAgg._sum.valorPagado?.toNumber() ?? 0,
      entregasRecientes: entregasRecientes.map((e) => ({
        id: e.id,
        suscripcionId: e.suscripcionId,
        cantidadEntregada: e.cantidadEntregada.toNumber(),
        valorPagado: e.valorPagado.toNumber(),
        imagenComprobanteId: e.imagenComprobantePagoId,
        createdAt: e.createdAt,
      })),
    };
  }
}
