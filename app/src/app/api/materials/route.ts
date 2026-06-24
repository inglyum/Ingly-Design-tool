import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserFromRequest } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const data = await prisma.material.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ data });
  } catch { return NextResponse.json({ error: "Non autorizzato" }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    const body = await req.json();
    const record = await prisma.material.create({ data: { ...body, userId } });
    return NextResponse.json(record);
  } catch { return NextResponse.json({ error: "Errore" }, { status: 500 }); }
}
