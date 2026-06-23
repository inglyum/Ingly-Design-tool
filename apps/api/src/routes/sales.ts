import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const SaleSchema = z.object({
  clientId: z.string().uuid().optional(),
  clientName: z.string().optional(),
  status: z.enum(["bozza","da_pagare","pagato","annullato","rimborso"]).default("da_pagare"),
  paymentMethod: z.string().optional(),
  items: z.array(z.any()).default([]),
  subtotal: z.number().default(0),
  taxRate: z.number().default(22),
  taxAmount: z.number().default(0),
  discount: z.number().default(0),
  totalAmount: z.number().default(0),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function salesRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  async function generateInvoiceNumber(tenantId: string): Promise<string> {
    const count = await prisma.sale.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    return `FT-${year}-${String(count + 1).padStart(3, "0")}`;
  }

  // GET /api/sales
  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const q = request.query as any;

    const where: any = { tenantId };
    if (q.status) where.status = q.status;
    if (q.search) {
      where.OR = [
        { clientName: { contains: q.search, mode: "insensitive" } },
        { invoiceNumber: { contains: q.search } },
      ];
    }
    if (q.from) where.createdAt = { gte: new Date(q.from) };
    if (q.to) where.createdAt = { ...where.createdAt, lte: new Date(q.to) };

    const page = parseInt(q.page || "1");
    const limit = parseInt(q.limit || "50");

    const [total, data] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Stats
    const stats = await prisma.sale.aggregate({
      where: { tenantId },
      _sum: { totalAmount: true, amountPaid: true },
    });

    return reply.send({
      data,
      total,
      page,
      limit,
      stats: {
        totalRevenue: Number(stats._sum.totalAmount || 0),
        totalPaid: Number(stats._sum.amountPaid || 0),
      },
    });
  });

  // POST /api/sales
  app.post("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const body = SaleSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation Error", details: body.error.errors });
    }

    const invoiceNumber = await generateInvoiceNumber(tenantId);
    const sale = await prisma.sale.create({
      data: {
        ...body.data,
        tenantId,
        invoiceNumber,
        createdBy: userId,
        currency: "EUR",
        issueDate: new Date(),
        dueDate: body.data.dueDate ? new Date(body.data.dueDate) : undefined,
        items: body.data.items as any,
      },
    });

    return reply.status(201).send(sale);
  });

  // GET /api/sales/:id
  app.get("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;

    const sale = await prisma.sale.findFirst({ where: { id, tenantId } });
    if (!sale) return reply.status(404).send({ error: "Fattura non trovata" });
    return reply.send(sale);
  });

  // PUT /api/sales/:id
  app.put("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const body = SaleSchema.partial().safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation Error", details: body.error.errors });
    }

    const existing = await prisma.sale.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Fattura non trovata" });

    const data: any = { ...body.data };
    if (body.data.status === "pagato" && !existing.paidAt) {
      data.paidAt = new Date();
      data.amountPaid = body.data.totalAmount || existing.totalAmount;
    }

    const sale = await prisma.sale.update({ where: { id }, data });
    return reply.send(sale);
  });

  // PATCH /api/sales/:id/status
  app.patch("/:id/status", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const { status } = request.body as any;

    const existing = await prisma.sale.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Fattura non trovata" });

    const data: any = { status };
    if (status === "pagato") {
      data.paidAt = new Date();
      data.amountPaid = existing.totalAmount;
    }

    const sale = await prisma.sale.update({ where: { id }, data });
    return reply.send(sale);
  });

  // DELETE /api/sales/:id
  app.delete("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;

    const existing = await prisma.sale.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Fattura non trovata" });

    await prisma.sale.update({ where: { id }, data: { status: "annullato" } });
    return reply.send({ success: true });
  });

  // GET /api/sales/stats
  app.get("/stats/summary", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [thisMonth, total, unpaid] = await Promise.all([
      prisma.sale.aggregate({
        where: { tenantId, status: "pagato", paidAt: { gte: monthStart } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { tenantId },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { tenantId, status: "da_pagare" },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    return reply.send({
      revenueThisMonth: Number(thisMonth._sum.totalAmount || 0),
      salesThisMonth: thisMonth._count,
      totalRevenue: Number(total._sum.totalAmount || 0),
      totalSales: total._count,
      unpaidAmount: Number(unpaid._sum.totalAmount || 0),
      unpaidCount: unpaid._count,
    });
  });
}
