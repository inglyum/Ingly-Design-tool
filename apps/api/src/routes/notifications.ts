import { FastifyInstance } from "fastify";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export async function notificationsRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  app.get("/", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const q = request.query as any;
    const where: any = { tenantId, userId };
    if (q.unread === "true") where.isRead = false;

    const [data, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.notification.count({ where: { tenantId, userId, isRead: false } }),
    ]);

    return reply.send({ data, unreadCount });
  });

  app.get("/unread-count", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const count = await prisma.notification.count({ where: { tenantId, userId, isRead: false } });
    return reply.send({ count });
  });

  app.patch("/:id/read", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const { id } = request.params as any;
    await prisma.notification.updateMany({
      where: { id, tenantId, userId },
      data: { isRead: true, readAt: new Date() },
    });
    return reply.send({ success: true });
  });

  app.patch("/read-all", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    await prisma.notification.updateMany({
      where: { tenantId, userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return reply.send({ success: true });
  });

  app.delete("/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    const { tenantId, userId } = request.user;
    const { id } = request.params as any;
    await prisma.notification.deleteMany({ where: { id, tenantId, userId } });
    return reply.send({ success: true });
  });
}
