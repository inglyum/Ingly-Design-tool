import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "ingly-secret-dev-change-in-prod");

// Valid license keys — in production these would be in a licenses table
const VALID_KEYS = new Set(["INGLY-DEMO-2026", "INGLY-PRO-2026", "INGLY-ENT-2026"]);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const { payload } = await jwtVerify(authHeader.slice(7), secret);
    const userId = payload.userId as string;

    const { key } = await req.json();
    if (!key) return NextResponse.json({ error: "Chiave licenza richiesta" }, { status: 400 });

    if (!VALID_KEYS.has(key.toUpperCase())) {
      return NextResponse.json({ error: "Chiave licenza non valida" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { licenseKey: key.toUpperCase(), licenseValid: true },
    });

    return NextResponse.json({ ok: true, message: "Licenza attivata con successo!" });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
