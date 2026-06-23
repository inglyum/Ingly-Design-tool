import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";

import { authRoutes } from "./routes/auth.js";
import { clientsRoutes } from "./routes/clients.js";
import { ordersRoutes } from "./routes/orders.js";
import { salesRoutes } from "./routes/sales.js";
import { quotesRoutes } from "./routes/quotes.js";
import { cashflowRoutes } from "./routes/cashflow.js";
import { productsRoutes } from "./routes/products.js";
import { inventoryRoutes } from "./routes/inventory.js";
import { analyticsRoutes } from "./routes/analytics.js";
import { notificationsRoutes } from "./routes/notifications.js";
import { adminRoutes } from "./routes/admin.js";
import { settingsRoutes } from "./routes/settings.js";
import { dashboardRoutes } from "./routes/dashboard.js";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

const PORT = Number(process.env.ADMIN_PORT || process.env.PORT || 4000);

async function start() {
  // ── Plugins ──────────────────────────────────────────────────
  await app.register(cors, {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(cookie, {
    secret: process.env.JWT_SECRET || "ingly-cookie-secret-dev",
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || "ingly-jwt-secret-dev-min-32-characters-long",
    cookie: { cookieName: "access_token", signed: false },
  });

  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Troppi tentativi. Riprova tra qualche secondo.",
    }),
  });

  // ── Health Check ──────────────────────────────────────────────
  app.get("/health", async () => ({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  }));

  // ── Routes ────────────────────────────────────────────────────
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  await app.register(clientsRoutes, { prefix: "/api/clients" });
  await app.register(ordersRoutes, { prefix: "/api/orders" });
  await app.register(salesRoutes, { prefix: "/api/sales" });
  await app.register(quotesRoutes, { prefix: "/api/quotes" });
  await app.register(cashflowRoutes, { prefix: "/api/cashflow" });
  await app.register(productsRoutes, { prefix: "/api/products" });
  await app.register(inventoryRoutes, { prefix: "/api/inventory" });
  await app.register(analyticsRoutes, { prefix: "/api/analytics" });
  await app.register(notificationsRoutes, { prefix: "/api/notifications" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
  await app.register(settingsRoutes, { prefix: "/api/settings" });

  // ── 404 Handler ───────────────────────────────────────────────
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Endpoint ${request.method} ${request.url} non trovato`,
    });
  });

  // ── Error Handler ─────────────────────────────────────────────
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      statusCode,
      error: error.name || "Internal Server Error",
      message: error.message || "Errore interno del server",
    });
  });

  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`🚀 INGLY OS API avviata su http://localhost:${PORT}`);
}

start().catch((err) => {
  console.error("Errore avvio server:", err);
  process.exit(1);
});
