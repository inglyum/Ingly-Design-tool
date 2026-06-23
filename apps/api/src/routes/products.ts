import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const ProductSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  type: z.string().optional(),
  material: z.string().optional(),
  costPrice: z.number().default(0),
  salePrice: z.number().default(0),
  minPrice: z.number().default(0),
  unit: z.string().default("pz"),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isCustomizable: z.boolean().default(false),
  leadTimeDays: z.number().default(0),
});

export async function productsRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const q = request.query as any;
    const where: any = { tenantId };
    if (q.search) where.OR = [
      { name: { contains: q.search, mode: "insensitive" } },
      { category: { contains: q.search, mode: "insensitive" } },
      { sku: { contains: q.search } },
    ];
    if (q.category) where.category = q.category;
    if (q.active !== "false") where.isActive = true;

    const page = parseInt(q.page || "1");
    const limit = parseInt(q.limit || "100");
    const [total, data] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({ where, orderBy: { name: "asc" }, skip: (page-1)*limit, take: limit }),
    ]);

    // Categories list
    const categories = await prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { category: true },
      distinct: ["category"],
    });

    return reply.send({ data, total, categories: categories.map((c) => c.category).filter(Boolean) });
  });

  app.post("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const body = ProductSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Validation Error", details: body.error.errors });

    const product = await prisma.product.create({
      data: { ...body.data, tenantId, createdBy: userId, currency: "EUR" },
    });
    return reply.status(201).send(product);
  });

  app.get("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const product = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!product) return reply.status(404).send({ error: "Prodotto non trovato" });
    return reply.send(product);
  });

  app.put("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const body = ProductSchema.partial().safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: "Validation Error", details: body.error.errors });

    const existing = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Prodotto non trovato" });

    const product = await prisma.product.update({ where: { id }, data: body.data });
    return reply.send(product);
  });

  app.delete("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const { id } = request.params as any;
    const existing = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!existing) return reply.status(404).send({ error: "Prodotto non trovato" });
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return reply.send({ success: true });
  });
}
