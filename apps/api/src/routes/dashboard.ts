import { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/auth.js";
import { getPrisma } from "../utils/prisma.js";

export async function dashboardRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  // GET /api/dashboard — KPI principali
  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenue questo mese
    const salesThisMonth = await prisma.sale.findMany({
      where: {
        tenantId,
        status: "pagato",
        paidAt: { gte: monthStart },
      },
      select: { totalAmount: true },
    });
    const revenueThisMonth = salesThisMonth.reduce(
      (a, s) => a + Number(s.totalAmount),
      0
    );

    // Revenue mese scorso
    const salesLastMonth = await prisma.sale.findMany({
      where: {
        tenantId,
        status: "pagato",
        paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      select: { totalAmount: true },
    });
    const revenueLastMonth = salesLastMonth.reduce(
      (a, s) => a + Number(s.totalAmount),
      0
    );

    const revDelta =
      revenueLastMonth > 0
        ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
        : 0;

    // Uscite questo mese
    const uscite = await prisma.cashflowEntry.aggregate({
      where: {
        tenantId,
        type: "uscita",
        date: { gte: monthStart },
      },
      _sum: { amount: true },
    });
    const expensesThisMonth = Number(uscite._sum.amount || 0);
    const profitThisMonth = revenueThisMonth - expensesThisMonth;
    const marginThisMonth =
      revenueThisMonth > 0
        ? Math.round((profitThisMonth / revenueThisMonth) * 100)
        : 0;

    // Ordini
    const ordersActive = await prisma.order.count({
      where: {
        tenantId,
        status: { notIn: ["completato", "delivered", "annullato"] },
      },
    });
    const ordersOverdue = await prisma.order.count({
      where: {
        tenantId,
        status: { notIn: ["completato", "delivered", "annullato"] },
        dueDate: { lt: now },
      },
    });

    // Clienti
    const clientsTotal = await prisma.client.count({
      where: { tenantId, isActive: true },
    });
    const clientsNew = await prisma.client.count({
      where: {
        tenantId,
        isActive: true,
        createdAt: { gte: monthStart },
      },
    });

    // Fatture non pagate
    const unpaidInvoices = await prisma.sale.aggregate({
      where: { tenantId, status: "da_pagare" },
      _sum: { totalAmount: true },
      _count: true,
    });

    // Ultimi ordini
    const recentOrders = await prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        clientName: true,
        status: true,
        priority: true,
        totalAmount: true,
        dueDate: true,
        createdAt: true,
      },
    });

    // Grafico revenue ultimi 6 mesi
    const revenueChart = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const r = await prisma.sale.aggregate({
        where: {
          tenantId,
          status: "pagato",
          paidAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });
      revenueChart.push({
        month: start.toLocaleDateString("it-IT", { month: "short", year: "2-digit" }),
        revenue: Number((r._sum as any).amount || 0),
      });
    }

    return reply.send({
      kpi: {
        revenueThisMonth,
        revenueLastMonth,
        revDelta,
        expensesThisMonth,
        profitThisMonth,
        marginThisMonth,
        ordersActive,
        ordersOverdue,
        clientsTotal,
        clientsNew,
        unpaidAmount: Number(unpaidInvoices._sum.totalAmount || 0),
        unpaidCount: unpaidInvoices._count,
      },
      recentOrders,
      revenueChart,
    });
  });
}
