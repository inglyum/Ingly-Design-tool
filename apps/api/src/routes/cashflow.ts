import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const CashflowSchema = z.object({
  type: z.enum(["entrata", "uscita"]),
  category: z.string().optional(),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  paymentMethod: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export async function cashflowRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const q = request.query as any;

    const where: any = { tenantId };
    if (q.type) where.type = q.type;
    if (q.from) where.date = { gte: new Date(q.from) };
    if (q.to) where.date = { ...where.date, lte: new Date(q.to) };

    const page = parseInt(q.page || "1");
    const limit = parseInt(q.limit || "100");

    const [total, data, summary] = await Promise.all([
      prisma.cashflowEntry.count({ where }),
      prisma.cashflowEntry.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.cashflowEntry.groupBy({
        by: ["type"],
        where: { tenantId },
        _sum: { amount: true },
      }),
    ]);

    const entrate = summary.find((s) => s.type === "entrata")?._sum?.amount || 0;
    const uscite = summary.find((s) => s.type === "uscita")?._sum?.amount || 0;

    return reply.send({
      data,
      total,
      summary: {
        entrate: Number(entrate),
        uscite: Number(uscite),
        saldo: Number(entrate) - Number(uscite),
      },
    });
  });

  app.post("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const body = CashflowSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation Error", details: body.error.errors });
    }

    const entry = await prisma.cashflowEntry.create({
      data: {
        ...body.data,
        tenantId,
        createdBy: userId,
        currency: "EUR",
        date: new Date(body.data.date),
      },
    });

    return reply.status(201).send(entry);
  });

  app.put("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const body = CashflowSchema.partial().safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation Error", details: body.error.errors });
    }

    const existing = await prisma.cashflowEntry.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Voce non trovata" });

    const data: any = { ...body.data };
    if (body.data.date) data.date = new Date(body.data.date);

    const entry = await prisma.cashflowEntry.update({ where: { id }, data });
    return reply.send(entry);
  });

  app.delete("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;

    const existing = await prisma.cashflowEntry.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Voce non trovata" });

    await prisma.cashflowEntry.delete({ where: { id } });
    return reply.send({ success: true });
  });

  app.get("/chart", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const chart = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [entrate, uscite] = await Promise.all([
        prisma.cashflowEntry.aggregate({
          where: { tenantId, type: "entrata", date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        prisma.cashflowEntry.aggregate({
          where: { tenantId, type: "uscita", date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]);

      chart.push({
        month: start.toLocaleDateString("it-IT", { month: "short", year: "2-digit" }),
        entrate: Number(entrate._sum.amount || 0),
        uscite: Number(uscite._sum.amount || 0),
      });
    }

    return reply.send(chart);
  });
}
