import { FastifyInstance } from "fastify";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export async function analyticsRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  // GET /api/analytics/dashboard
  app.get("/dashboard", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Top prodotti per revenue (da items nelle vendite)
    const salesWithItems = await prisma.sale.findMany({
      where: { tenantId, status: "pagato" },
      select: { items: true, totalAmount: true },
    });

    // Vendite per mese (ultimi 12 mesi)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const r = await prisma.sale.aggregate({
        where: { tenantId, status: "pagato", paidAt: { gte: start, lte: end } },
        _sum: { totalAmount: true },
        _count: true,
      });
      monthlyRevenue.push({
        month: start.toLocaleDateString("it-IT", { month: "short", year: "2-digit" }),
        revenue: Number(r._sum.totalAmount || 0),
        sales: r._count,
      });
    }

    // Ordini per status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { id: true },
    });

    // Clienti per tipo
    const clientsByType = await prisma.client.groupBy({
      by: ["type"],
      where: { tenantId, isActive: true },
      _count: { id: true },
    });

    // Top clienti per revenue
    const topClients = await prisma.client.findMany({
      where: { tenantId, isActive: true },
      orderBy: { totalRevenue: "desc" },
      take: 5,
      select: { id: true, firstName: true, lastName: true, companyName: true, totalRevenue: true, ordersCount: true },
    });

    // Cashflow per categoria
    const cashflowByCategory = await prisma.cashflowEntry.groupBy({
      by: ["category", "type"],
      where: { tenantId, date: { gte: monthStart } },
      _sum: { amount: true },
    });

    return reply.send({
      monthlyRevenue,
      ordersByStatus,
      clientsByType,
      topClients,
      cashflowByCategory,
    });
  });

  // GET /api/analytics/forecast
  app.get("/forecast", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const now = new Date();

    // Raccoglie dati ultimi 6 mesi
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const r = await prisma.sale.aggregate({
        where: { tenantId, status: "pagato", paidAt: { gte: start, lte: end } },
        _sum: { totalAmount: true },
      });
      monthly.push(Number(r._sum.totalAmount || 0));
    }

    // Linear regression semplice
    const n = monthly.length;
    const avgX = (n - 1) / 2;
    const avgY = monthly.reduce((a, v) => a + v, 0) / n;
    let num = 0, den = 0;
    monthly.forEach((y, x) => {
      num += (x - avgX) * (y - avgY);
      den += (x - avgX) ** 2;
    });
    const slope = den !== 0 ? num / den : 0;
    const intercept = avgY - slope * avgX;

    const forecast = [1, 2, 3].map((step) => ({
      month: new Date(now.getFullYear(), now.getMonth() + step, 1).toLocaleDateString("it-IT", { month: "long", year: "numeric" }),
      predicted: Math.max(0, Math.round(intercept + slope * (n - 1 + step))),
      optimistic: Math.max(0, Math.round((intercept + slope * (n - 1 + step)) * 1.15)),
      conservative: Math.max(0, Math.round((intercept + slope * (n - 1 + step)) * 0.9)),
    }));

    return reply.send({
      historical: monthly,
      forecast,
      trend: slope > 0 ? "crescita" : slope < -50 ? "calo" : "stabile",
      trendValue: Math.round(slope),
    });
  });
}
