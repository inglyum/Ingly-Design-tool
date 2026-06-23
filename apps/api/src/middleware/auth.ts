import { FastifyRequest, FastifyReply } from "fastify";
import { getPrisma } from "../utils/prisma.js";

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Token non valido o scaduto. Effettua nuovamente il login.",
    });
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const { role } = request.user;
    if (role !== "superadmin" && role !== "admin") {
      reply.status(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "Accesso riservato agli amministratori.",
      });
    }
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Autenticazione richiesta.",
    });
  }
}

export async function requireOwnerOrAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    const { role } = request.user;
    if (!["owner", "admin", "superadmin"].includes(role)) {
      reply.status(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "Permessi insufficienti.",
      });
    }
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Autenticazione richiesta.",
    });
  }
}
