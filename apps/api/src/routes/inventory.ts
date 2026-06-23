import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const ItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  unit: z.string().default("pz"),
  quantity: z.number().default(0),
  minQuantity: z.number().default(2),
  reorderPoint: z.number().default(5),
  unitCost: z.number().default(0),
  location: z.string().optional(),
  barcode: z.string().optional(),
  notes: z.string().optional(),
});

export async function inventoryRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const q = request.query as any;
    const where: any = { tenantId };
    if (q.search) where.OR = [
      { name: { contains: q.search, mode: "insensitive" } },
      { category: { contains: q.search, mode: "insensitive" } },
    ];
    if (q.alerts === "true") where.quantity = { lte: prisma.inventoryItem.fields.minQuantity };

    const data = await prisma.inventoryItem.findMany({ where, orderBy: { name: "asc" } });

    const alerts = data.filter((i) => Number(i.quantity) <= Number(i.minQuantity));
    const totalValue = data.reduce((a, i) => a + Number(i.quantity) * Number(i.unitCost), 0);

    return reply.send({ data, alerts, totalValue });
  });

  app.get("/alerts", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const all = await prisma.inventoryItem.findMany({ where: { tenantId } });
    const alerts = all.filter((i) => Number(i.quantity) <= Number(i.minQuantity));
    return reply.send(alerts);
  });

  app.post("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const body = ItemSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Validation Error", details: body.error.errors });

    const item = await prisma.inventoryItem.create({ data: { ...body.data, tenantId } });
    return reply.status(201).send(item);
  });

  app.put("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const body = ItemSchema.partial().safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Validation Error", details: body.error.errors });

    const existing = await prisma.inventoryItem.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Articolo non trovato" });

    const item = await prisma.inventoryItem.update({ where: { id }, data: body.data });
    return reply.send(item);
  });

  app.patch("/:id/quantity", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const { quantity, operation } = request.body as any;

    const existing = await prisma.inventoryItem.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Articolo non trovato" });

    let newQty = Number(existing.quantity);
    if (operation === "add") newQty += Number(quantity);
    else if (operation === "subtract") newQty = Math.max(0, newQty - Number(quantity));
    else newQty = Number(quantity);

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: newQty, lastRestockedAt: operation === "add" ? new Date() : undefined },
    });
    return reply.send(item);
  });

  app.delete("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const existing = await prisma.inventoryItem.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Articolo non trovato" });
    await prisma.inventoryItem.delete({ where: { id } });
    return reply.send({ success: true });
  });
}
