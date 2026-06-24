import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "ingly-secret-dev-change-in-prod");

const TABLE_MAP: Record<string, any> = {
  clients: prisma.client,
  orders: prisma.order,
  sales: prisma.sale,
  quotes: prisma.quote,
  cashflows: prisma.cashflowEntry,
  products: prisma.product,
};

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("401");
  const { payload } = await jwtVerify(authHeader.slice(7), secret);
  return payload.userId as string;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const userId = await getUser(req);
    const { table: tableName } = await params;
    const table = TABLE_MAP[tableName];
    if (!table) return NextResponse.json({ error: "Tabella non valida" }, { status: 400 });

    const body = await req.json();
    const { _dirty, _deleted, ...data } = body;

    const record = await table.upsert({
      where: { id: data.id || "new" },
      update: { ...data, userId },
      create: { ...data, userId },
    });

    return NextResponse.json(record);
  } catch (e: any) {
    if (e.message === "401") return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  try {
    const userId = await getUser(req);
    const { table: tableName } = await params;
    const table = TABLE_MAP[tableName];
    if (!table) return NextResponse.json({ error: "Tabella non valida" }, { status: 400 });

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return NextResponse.json({ error: "ID richiesto" }, { status: 400 });

    await table.deleteMany({ where: { id, userId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === "401") return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
