import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const ClientSchema = z.object({
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("IT"),
  vatNumber: z.string().optional(),
  fiscalCode: z.string().optional(),
  sdiCode: z.string().optional(),
  pecEmail: z.string().optional(),
  type: z.enum(["b2b", "b2c"]).default("b2c"),
  segment: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  source: z.string().optional(),
});

export async function clientsRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  // GET /api/clients
  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const q = request.query as any;

    const where: any = { tenantId };
    if (q.search) {
      where.OR = [
        { firstName: { contains: q.search, mode: "insensitive" } },
        { lastName: { contains: q.search, mode: "insensitive" } },
        { companyName: { contains: q.search, mode: "insensitive" } },
        { email: { contains: q.search, mode: "insensitive" } },
        { phone: { contains: q.search } },
      ];
    }
    if (q.type) where.type = q.type;
    if (q.active !== undefined) where.isActive = q.active !== "false";

    const page = parseInt(q.page || "1");
    const limit = parseInt(q.limit || "50");

    const [total, data] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return reply.send({ data, total, page, limit, pages: Math.ceil(total / limit) });
  });

  // POST /api/clients
  app.post("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const body = ClientSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation Error", details: body.error.errors });
    }

    const client = await prisma.client.create({
      data: { ...body.data, tenantId, createdBy: userId },
    });

    return reply.status(201).send(client);
  });

  // GET /api/clients/:id
  app.get("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;

    const client = await prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        orders: { orderBy: { createdAt: "desc" }, take: 10 },
        sales: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!client) return reply.status(404).send({ error: "Cliente non trovato" });
    return reply.send(client);
  });

  // PUT /api/clients/:id
  app.put("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const body = ClientSchema.partial().safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation Error", details: body.error.errors });
    }

    const existing = await prisma.client.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Cliente non trovato" });

    const client = await prisma.client.update({
      where: { id },
      data: body.data,
    });

    return reply.send(client);
  });

  // DELETE /api/clients/:id
  app.delete("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;

    const existing = await prisma.client.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Cliente non trovato" });

    // Soft delete
    await prisma.client.update({ where: { id }, data: { isActive: false } });
    return reply.send({ success: true });
  });

  // GET /api/clients/:id/stats
  app.get("/:id/stats", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;

    const client = await prisma.client.findFirst({ where: { id, tenantId } });
    if (!client) return reply.status(404).send({ error: "Cliente non trovato" });

    const [ordersCount, totalRevenue, avgOrderValue] = await Promise.all([
      prisma.order.count({ where: { tenantId, clientId: id } }),
      prisma.sale.aggregate({
        where: { tenantId, clientId: id, status: "pagato" },
        _sum: { totalAmount: true },
      }),
      prisma.sale.aggregate({
        where: { tenantId, clientId: id, status: "pagato" },
        _avg: { totalAmount: true },
      }),
    ]);

    return reply.send({
      ordersCount,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      avgOrderValue: Number(avgOrderValue._avg.totalAmount || 0),
    });
  });
}
