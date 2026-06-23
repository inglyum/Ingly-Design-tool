import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "ingly-secret-dev-change-in-prod");

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email e password richiesti" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Credenziali non valide" }, { status: 401 });

    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // Store session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: randomBytes(32).toString("hex"),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, licenseValid: user.licenseValid },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
