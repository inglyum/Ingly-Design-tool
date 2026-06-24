import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserFromRequest } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const data = await prisma.quote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });
    return NextResponse.json({ data });
  } catch { return NextResponse.json({ error: "Non autorizzato" }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const body = await req.json();
    const { client, ...data } = body;
    const count = await prisma.quote.count({ where: { userId } });
    const quoteNumber = `PRV-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
    const record = await prisma.quote.create({ data: { ...data, userId, quoteNumber } });
    return NextResponse.json(record);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
