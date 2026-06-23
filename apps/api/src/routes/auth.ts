import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";
import { getPrisma } from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const LoginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "Password richiesta"),
});

// Dev-only hash (matches seed.ts)
function devHash(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "ingly_salt_dev")
    .digest("hex");
}

async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // Try bcrypt first, fallback to dev hash
  try {
    if (hash.startsWith("$2b$") || hash.startsWith("$2a$")) {
      return await bcrypt.compare(plain, hash);
    }
    return devHash(plain) === hash;
  } catch {
    return devHash(plain) === hash;
  }
}

export async function authRoutes(app: FastifyInstance) {
  const prisma = getPrisma();

  // POST /api/auth/login
  app.post("/login", async (request, reply) => {
    const body = LoginSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Validation Error",
        message: body.error.errors[0].message,
      });
    }

    const { email, password } = body.data;

    // Check admin users first
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (adminUser) {
      const ok = await verifyPassword(password, adminUser.passwordHash);
      if (!ok || !adminUser.isActive) {
        return reply.status(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "Credenziali non valide o account non attivo.",
        });
      }

      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() },
      });

      const token = app.jwt.sign(
        {
          userId: adminUser.id,
          tenantId: "admin",
          role: adminUser.role,
          email: adminUser.email,
        },
        { expiresIn: "8h" }
      );

      return reply.send({
        token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          fullName: adminUser.fullName,
          role: adminUser.role,
          isAdmin: true,
        },
      });
    }

    // Check tenant users
    const user = await prisma.user.findFirst({
      where: {
        email,
        status: "active",
      },
      include: {
        tenant: {
          include: {
            subscriptions: {
              include: { plan: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Credenziali non valide.",
      });
    }

    const passwordOk = await verifyPassword(password, user.passwordHash);
    if (!passwordOk) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Credenziali non valide.",
      });
    }

    if (user.tenant.status === "suspended") {
      return reply.status(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "Account sospeso. Contatta il supporto.",
      });
    }

    if (user.tenant.status === "banned") {
      return reply.status(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "Account bannato.",
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    const refreshToken = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
        expiresAt,
      },
    });

    const accessToken = app.jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        email: user.email,
      },
      { expiresIn: "15m" }
    );

    const subscription = user.tenant.subscriptions[0];

    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return reply.send({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isAdmin: false,
      },
      tenant: {
        id: user.tenant.id,
        slug: user.tenant.slug,
        companyName: user.tenant.companyName,
        status: user.tenant.status,
        plan: subscription?.plan || null,
      },
    });
  });

  // POST /api/auth/refresh
  app.post("/refresh", async (request, reply) => {
    const refreshToken =
      (request.cookies as any).refresh_token ||
      (request.body as any)?.refreshToken;

    if (!refreshToken) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Refresh token mancante.",
      });
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: { include: { tenant: true } } },
    });

    if (
      !session ||
      session.isRevoked ||
      session.expiresAt < new Date()
    ) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Sessione scaduta. Effettua il login.",
      });
    }

    const newToken = app.jwt.sign(
      {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        role: session.user.role,
        email: session.user.email,
      },
      { expiresIn: "15m" }
    );

    // Rotate refresh token
    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    reply.setCookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return reply.send({ token: newToken });
  });

  // POST /api/auth/logout
  app.post("/logout", { preHandler: [requireAuth] }, async (request, reply) => {
    const refreshToken = (request.cookies as any).refresh_token;
    if (refreshToken) {
      await prisma.session.updateMany({
        where: { refreshToken },
        data: { isRevoked: true },
      });
    }
    reply.clearCookie("refresh_token", { path: "/" });
    return reply.send({ success: true, message: "Logout effettuato." });
  });

  // GET /api/auth/me
  app.get("/me", { preHandler: [requireAuth] }, async (request, reply) => {
    const { userId, tenantId } = request.user;

    if (tenantId === "admin") {
      const admin = await getPrisma().adminUser.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true, role: true },
      });
      return reply.send({ user: { ...admin, isAdmin: true }, tenant: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          include: {
            subscriptions: {
              include: { plan: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Utente non trovato.",
      });
    }

    const sub = user.tenant.subscriptions[0];

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isAdmin: false,
        mfaEnabled: user.mfaEnabled,
      },
      tenant: {
        id: user.tenant.id,
        slug: user.tenant.slug,
        companyName: user.tenant.companyName,
        logoUrl: user.tenant.logoUrl,
        status: user.tenant.status,
        plan: sub?.plan || null,
      },
    });
  });
}
