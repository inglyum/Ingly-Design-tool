import { FastifyInstance } from "fastify";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export async function settingsRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId } = request.user;
    const settings = await prisma.setting.findMany({ where: { tenantId } });
    const map: Record<string, any> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return reply.send(map);
  });

  app.put("/:key", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const { key } = request.params as any;
    const { value } = request.body as any;

    const setting = await prisma.setting.upsert({
      where: { tenantId_key: { tenantId, key } },
      create: { tenantId, key, value, updatedBy: userId },
      update: { value, updatedBy: userId },
    });
    return reply.send(setting);
  });
}
