import { FastifyInstance } from "fastify";
import { getPrisma } from "../utils/prisma.js";
import { requireAdmin } from "../middleware/auth.js";

export async function adminRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  // GET /api/admin/stats — Dashboard Super Admin
  app.get("/stats", { preHandler: [requireAdmin] }, async (request, reply) => {
    const [
      tenantsTotal,
      tenantsActive,
      tenantsTrial,
      tenantsSuspended,
      usersTotal,
      subscriptionsActive,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: "active" } }),
      prisma.tenant.count({ where: { status: "trial" } }),
      prisma.tenant.count({ where: { status: "suspended" } }),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "active" } }),
    ]);

    // MRR approssimativo
    const activeSubs = await prisma.subscription.findMany({
      where: { status: "active" },
      include: { plan: true },
    });
    const mrr = activeSubs.reduce((a, s) => a + Number(s.plan.priceMonthly), 0);

    return reply.send({
      tenants: { total: tenantsTotal, active: tenantsActive, trial: tenantsTrial, suspended: tenantsSuspended },
      usersTotal,
      subscriptionsActive,
      mrr,
    });
  });

  // GET /api/admin/tenants
  app.get("/tenants", { preHandler: [requireAdmin] }, async (request, reply) => {
    const q = request.query as any;
    const where: any = {};
    if (q.status) where.status = q.status;
    if (q.search) where.OR = [
      { companyName: { contains: q.search, mode: "insensitive" } },
      { email: { contains: q.search, mode: "insensitive" } },
      { slug: { contains: q.search } },
    ];

    const page = parseInt(q.page || "1");
    const limit = parseInt(q.limit || "50");

    const [total, data] = await Promise.all([
      prisma.tenant.count({ where }),
      prisma.tenant.findMany({
        where,
        include: {
          subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { users: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return reply.send({ data, total });
  });

  // GET /api/admin/tenants/:id
  app.get("/tenants/:id", { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as any;
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        subscriptions: { include: { plan: true } },
        users: { select: { id: true, email: true, fullName: true, role: true, status: true, lastLoginAt: true } },
        licenses: true,
      },
    });
    if (!tenant) return reply.status(404).send({ error: "Tenant non trovato" });
    return reply.send(tenant);
  });

  // PATCH /api/admin/tenants/:id/status
  app.patch("/tenants/:id/status", { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as any;
    const { status } = request.body as any;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: { status },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: request.user.userId,
        tenantId: id,
        action: `TENANT_STATUS_CHANGE`,
        entityType: "tenant",
        entityId: id,
        afterState: { status },
        ipAddress: request.ip,
      },
    });

    return reply.send(tenant);
  });

  // POST /api/admin/users/:id/force-logout
  app.post("/users/:id/force-logout", { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as any;

    await prisma.session.updateMany({
      where: { userId: id },
      data: { isRevoked: true },
    });

    await prisma.adminAction.create({
      data: {
        adminId: request.user.userId,
        action: "FORCE_LOGOUT",
        entityType: "user",
        entityId: id,
        ipAddress: request.ip,
      },
    });

    return reply.send({ success: true, message: "Tutte le sessioni revocate." });
  });

  // GET /api/admin/audit-logs
  app.get("/audit-logs", { preHandler: [requireAdmin] }, async (request, reply) => {
    const q = request.query as any;
    const where: any = {};
    if (q.tenantId) where.tenantId = q.tenantId;
    if (q.adminId) where.adminId = q.adminId;

    const data = await prisma.adminAction.findMany({
      where,
      include: { admin: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return reply.send(data);
  });

  // GET /api/admin/licenses
  app.get("/licenses", { preHandler: [requireAdmin] }, async (request, reply) => {
    const data = await prisma.license.findMany({
      include: {
        tenant: { select: { companyName: true, email: true } },
        devices: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return reply.send(data);
  });

  // POST /api/admin/licenses/:id/revoke
  app.post("/licenses/:id/revoke", { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as any;
    const license = await prisma.license.update({
      where: { id },
      data: { status: "revoked" },
    });
    return reply.send(license);
  });
}
