import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const setupKey = process.env.SETUP_KEY || "setup2026";

  if (key !== setupKey) {
    return NextResponse.json({ error: "Chiave non valida. Usa ?key=setup2026" }, { status: 401 });
  }

  try {
    // Check if already seeded
    const existing = await prisma.user.findUnique({ where: { email: "mario@laserartstudio.it" } });
    if (existing) {
      return NextResponse.json({ ok: true, message: "✅ Dati già presenti. Login: mario@laserartstudio.it / Demo2026!" });
    }

    const hash = await bcrypt.hash("Demo2026!", 10);
    const user = await prisma.user.create({
      data: {
        email: "mario@laserartstudio.it",
        passwordHash: hash,
        fullName: "Mario Rossi",
        role: "owner",
        licenseKey: "INGLY-DEMO-2026",
        licenseValid: true,
      },
    });

    const clients = await Promise.all([
      prisma.client.create({ data: { userId: user.id, firstName: "Giulia", lastName: "Ferrari", companyName: "Ferrari Design SRL", email: "giulia@ferraridesign.it", type: "b2b" } }),
      prisma.client.create({ data: { userId: user.id, firstName: "Marco", lastName: "Bianchi", email: "marco@gmail.com", type: "b2c" } }),
      prisma.client.create({ data: { userId: user.id, firstName: "Sara", lastName: "Romano", companyName: "Romano Events", email: "sara@romanoevents.it", type: "b2b" } }),
    ]);

    const now = new Date();
    await Promise.all([
      prisma.order.create({ data: { userId: user.id, clientId: clients[0].id, clientName: "Ferrari Design SRL", orderNumber: "ORD-2026-001", status: "working", priority: "alta", totalAmount: 450, dueDate: new Date(now.getTime() + 3 * 86400000), notes: "Incisione laser 50 pezzi", synced: true } }),
      prisma.order.create({ data: { userId: user.id, clientId: clients[1].id, clientName: "Marco Bianchi", orderNumber: "ORD-2026-002", status: "backlog", priority: "normale", totalAmount: 120, synced: true } }),
      prisma.order.create({ data: { userId: user.id, clientId: clients[2].id, clientName: "Romano Events", orderNumber: "ORD-2026-003", status: "attesa", priority: "urgente", totalAmount: 890, dueDate: new Date(now.getTime() - 2 * 86400000), synced: true } }),
    ]);

    await Promise.all([
      prisma.sale.create({ data: { userId: user.id, clientId: clients[0].id, clientName: "Ferrari Design SRL", invoiceNumber: "FT-2026-001", status: "pagato", subtotal: 450, taxAmount: 99, totalAmount: 549, issueDate: new Date(now.getTime() - 10 * 86400000), paidAt: new Date(now.getTime() - 5 * 86400000), synced: true } }),
      prisma.sale.create({ data: { userId: user.id, clientId: clients[2].id, clientName: "Romano Events", invoiceNumber: "FT-2026-002", status: "da_pagare", subtotal: 890, taxAmount: 195.8, totalAmount: 1085.8, issueDate: new Date(now.getTime() - 3 * 86400000), synced: true } }),
    ]);

    await Promise.all([
      prisma.cashflowEntry.create({ data: { userId: user.id, type: "entrata", amount: 549, description: "Pagamento Ferrari Design", category: "vendite", date: new Date(now.getTime() - 5 * 86400000) } }),
      prisma.cashflowEntry.create({ data: { userId: user.id, type: "uscita", amount: 280, description: "Materiali MDF e acrilico", category: "materiali", date: new Date(now.getTime() - 7 * 86400000) } }),
      prisma.cashflowEntry.create({ data: { userId: user.id, type: "uscita", amount: 450, description: "Affitto laboratorio", category: "affitto", date: new Date(now.getTime() - 1 * 86400000) } }),
    ]);

    await Promise.all([
      prisma.product.create({ data: { userId: user.id, name: "Incisione Laser MDF", sku: "INC-MDF-01", category: "Incisioni", price: 25, cost: 8, unit: "pz" } }),
      prisma.product.create({ data: { userId: user.id, name: "Taglio Acrilico", sku: "TAG-ACR-01", category: "Tagli", price: 35, cost: 12, unit: "m²" } }),
      prisma.product.create({ data: { userId: user.id, name: "Targa Personalizzata", sku: "TAR-PER-01", category: "Targhe", price: 45, cost: 15, unit: "pz" } }),
    ]);

    // Seed materiali
    await Promise.all([
      prisma.material.create({ data: { userId: user.id, name: "MDF 3mm", category: "materiale", unit: "mq", costPerUnit: 8, pricePerUnit: 18, stock: 50, minStock: 10 } }),
      prisma.material.create({ data: { userId: user.id, name: "Acrilico Trasparente 3mm", category: "materiale", unit: "mq", costPerUnit: 12, pricePerUnit: 28, stock: 20, minStock: 5 } }),
      prisma.material.create({ data: { userId: user.id, name: "Laser CO2 50W", category: "laser", unit: "ora", costPerUnit: 8, pricePerUnit: 20, stock: 0, minStock: 0 } }),
      prisma.material.create({ data: { userId: user.id, name: "Manodopera Assemblaggio", category: "manodopera", unit: "ora", costPerUnit: 15, pricePerUnit: 35, stock: 0, minStock: 0 } }),
      prisma.material.create({ data: { userId: user.id, name: "Vernice Spray RAL", category: "verniciatura", unit: "mq", costPerUnit: 3, pricePerUnit: 8, stock: 30, minStock: 5 } }),
    ]);

    // Seed costi fissi
    await Promise.all([
      prisma.fixedCost.create({ data: { userId: user.id, name: "Affitto Laboratorio", amount: 800, frequency: "monthly", category: "affitto", active: true } }),
      prisma.fixedCost.create({ data: { userId: user.id, name: "Laser CO2 (Leasing)", amount: 350, frequency: "monthly", category: "macchinari", active: true } }),
      prisma.fixedCost.create({ data: { userId: user.id, name: "Elettricità", amount: 180, frequency: "monthly", category: "utenze", active: true } }),
      prisma.fixedCost.create({ data: { userId: user.id, name: "Commercialista", amount: 1200, frequency: "yearly", category: "software", active: true } }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "🎉 Setup completato! Vai su /login",
      credentials: { email: "mario@laserartstudio.it", password: "Demo2026!" }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
