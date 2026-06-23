import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const QuoteSchema = z.object({
  clientId: z.string().uuid().optional(),
  clientName: z.string().optional(),
  status: z.enum(["draft","sent","accepted","rejected","expired"]).default("draft"),
  items: z.array(z.any()).default([]),
  subtotal: z.number().default(0),
  taxRate: z.number().default(22),
  taxAmount: z.number().default(0),
  discount: z.number().default(0),
  totalAmount: z.number().default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  validUntil: z.string().optional(),
});

export async function quotesRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  async function generateQuoteNumber(tenantId: string): Promise<string> {
    const count = await prisma.quote.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    return `PRV-${year}-${String(count + 1).padStart(3, "0")}`;
  }

  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const q = request.query as any;
    const where: any = { tenantId };
    if (q.status) where.status = q.status;
    if (q.search) where.OR = [
      { clientName: { contains: q.search, mode: "insensitive" } },
      { quoteNumber: { contains: q.search } },
    ];

    const page = parseInt(q.page || "1");
    const limit = parseInt(q.limit || "50");
    const [total, data] = await Promise.all([
      prisma.quote.count({ where }),
      prisma.quote.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page-1)*limit, take: limit }),
    ]);
    return reply.send({ data, total });
  });

  app.post("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const body = QuoteSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Validation Error", details: body.error.errors });

    const quoteNumber = await generateQuoteNumber(tenantId);
    const quote = await prisma.quote.create({
      data: {
        ...body.data,
        tenantId,
        quoteNumber,
        createdBy: userId,
        currency: "EUR",
        validUntil: body.data.validUntil ? new Date(body.data.validUntil) : undefined,
        items: body.data.items as any,
      },
    });
    return reply.status(201).send(quote);
  });

  app.get("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const quote = await prisma.quote.findFirst({ where: { id, tenantId } });
    if (!quote) return reply.status(404).send({ error: "Preventivo non trovato" });
    return reply.send(quote);
  });

  app.put("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const body = QuoteSchema.partial().safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Validation Error", details: body.error.errors });

    const existing = await prisma.quote.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Preventivo non trovato" });

    const data: any = { ...body.data };
    if (body.data.validUntil) data.validUntil = new Date(body.data.validUntil);
    if (body.data.status === "accepted") data.acceptedAt = new Date();

    const quote = await prisma.quote.update({ where: { id }, data });
    return reply.send(quote);
  });

  app.delete("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const existing = await prisma.quote.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Preventivo non trovato" });
    await prisma.quote.delete({ where: { id } });
    return reply.send({ success: true });
  });
}
