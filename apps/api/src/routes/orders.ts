import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const OrderSchema = z.object({
  clientId: z.string().uuid().optional(),
  clientName: z.string().optional(),
  status: z.enum(["backlog","attesa","working","done","delivered","completato","annullato"]).default("backlog"),
  priority: z.enum(["low","normal","high","urgent"]).default("normal"),
  items: z.array(z.any()).default([]),
  totalAmount: z.number().default(0),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
  assignedTo: z.string().uuid().optional(),
});

export async function ordersRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  async function generateOrderNumber(tenantId: string): Promise<string> {
    const count = await prisma.order.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    return `ORD-${year}-${String(count + 1).padStart(3, "0")}`;
  }

  // GET /api/orders
  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const q = request.query as any;

    const where: any = { tenantId };
    if (q.status) where.status = q.status;
    if (q.priority) where.priority = q.priority;
    if (q.search) {
      where.OR = [
        { clientName: { contains: q.search, mode: "insensitive" } },
        { orderNumber: { contains: q.search } },
        { notes: { contains: q.search, mode: "insensitive" } },
      ];
    }
    if (q.overdue === "true") where.dueDate = { lt: new Date() };

    const page = parseInt(q.page || "1");
    const limit = parseInt(q.limit || "100");

    const [total, data] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return reply.send({ data, total });
  });

  // GET /api/orders/kanban
  app.get("/kanban", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;

    const orders = await prisma.order.findMany({
      where: { tenantId, status: { not: "annullato" } },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    });

    const columns = {
      backlog: orders.filter((o) => o.status === "backlog"),
      attesa: orders.filter((o) => o.status === "attesa"),
      working: orders.filter((o) => o.status === "working"),
      done: orders.filter((o) => o.status === "done"),
      delivered: orders.filter((o) => o.status === "delivered" || o.status === "completato"),
    };

    return reply.send(columns);
  });

  // POST /api/orders
  app.post("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const body = OrderSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation Error", details: body.error.errors });
    }

    const orderNumber = await generateOrderNumber(tenantId);
    const order = await prisma.order.create({
      data: {
        ...body.data,
        tenantId,
        orderNumber,
        createdBy: userId,
        currency: "EUR",
        dueDate: body.data.dueDate ? new Date(body.data.dueDate) : undefined,
        items: body.data.items as any,
      },
    });

    return reply.status(201).send(order);
  });

  // GET /api/orders/:id
  app.get("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;

    const order = await prisma.order.findFirst({ where: { id, tenantId } });
    if (!order) return reply.status(404).send({ error: "Ordine non trovato" });
    return reply.send(order);
  });

  // PUT /api/orders/:id
  app.put("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const body = OrderSchema.partial().safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: "Validation Error", details: body.error.errors });
    }

    const existing = await prisma.order.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Ordine non trovato" });

    const data: any = { ...body.data };
    if (body.data.dueDate) data.dueDate = new Date(body.data.dueDate);
    if (body.data.status === "completato" || body.data.status === "delivered") {
      data.completedAt = new Date();
    }

    const order = await prisma.order.update({ where: { id }, data });
    return reply.send(order);
  });

  // PATCH /api/orders/:id/status
  app.patch("/:id/status", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const { status } = request.body as any;

    const existing = await prisma.order.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Ordine non trovato" });

    const data: any = { status };
    if (status === "completato" || status === "delivered") data.completedAt = new Date();

    const order = await prisma.order.update({ where: { id }, data });
    return reply.send(order);
  });

  // DELETE /api/orders/:id
  app.delete("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;

    const existing = await prisma.order.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Ordine non trovato" });

    await prisma.order.update({
      where: { id },
      data: { status: "annullato" },
    });

    return reply.send({ success: true });
  });
}
