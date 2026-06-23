import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "ingly-secret-dev-change-in-prod");

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { payload } = await jwtVerify(authHeader.slice(7), secret);
    const userId = payload.userId as string;

    const [clients, orders, sales, quotes, cashflows, products] = await Promise.all([
      prisma.client.findMany({ where: { userId } }),
      prisma.order.findMany({ where: { userId } }),
      prisma.sale.findMany({ where: { userId } }),
      prisma.quote.findMany({ where: { userId } }),
      prisma.cashflowEntry.findMany({ where: { userId } }),
      prisma.product.findMany({ where: { userId } }),
    ]);

    return NextResponse.json({ clients, orders, sales, quotes, cashflows, products });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
