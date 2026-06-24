import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserFromRequest } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserFromRequest(req);
    const { id } = await params;
    const body = await req.json();
    const { client, ...data } = body;
    await prisma.quote.updateMany({ where: { id, userId }, data });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Errore" }, { status: 500 }); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserFromRequest(req);
    const { id } = await params;
    await prisma.quote.deleteMany({ where: { id, userId } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Errore" }, { status: 500 }); }
}
