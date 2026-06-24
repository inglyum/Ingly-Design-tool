import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "ingly-secret-dev-change-in-prod");

export async function getUserFromRequest(req: NextRequest): Promise<string> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) throw new Error("401");
  const { payload } = await jwtVerify(auth.slice(7), secret);
  return payload.userId as string;
}
