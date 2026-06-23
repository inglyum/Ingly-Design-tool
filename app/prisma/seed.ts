import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Demo2026!", 10);

  const user = await prisma.user.upsert({
    where: { email: "mario@laserartstudio.it" },
    update: {},
    create: {
      email: "mario@laserartstudio.it",
      passwordHash: hash,
      fullName: "Mario Rossi",
      role: "owner",
      licenseKey: "INGLY-DEMO-2026",
      licenseValid: true,
    },
  });

  // Seed clients
  const clientData = [
    { firstName: "Giulia", lastName: "Ferrari", companyName: "Ferrari Design SRL", email: "giulia@ferraridesign.it", type: "b2b" },
    { firstName: "Marco", lastName: "Bianchi", email: "marco.bianchi@gmail.com", type: "b2c" },
    { firstName: "Sara", lastName: "Romano", companyName: "Romano Events", email: "sara@romanoevents.it", type: "b2b" },
    { firstName: "Luca", lastName: "Conti", email: "luca.conti@libero.it", type: "b2c" },
    { firstName: "Anna", lastName: "Esposito", companyName: "Esposito Gioielli", email: "anna@espositogioielli.com", type: "b2b" },
  ];

  const clients = await Promise.all(clientData.map((c) =>
    prisma.client.create({ data: { ...c, userId: user.id } })
  ));

  // Seed orders
  const now = new Date();
  const orderData = [
    { clientName: "Ferrari Design SRL", clientId: clients[0].id, status: "working", priority: "alta", totalAmount: 450, dueDate: new Date(now.getTime() + 3 * 86400000), notes: "Incisione laser 50 pezzi" },
    { clientName: "Marco Bianchi", clientId: clients[1].id, status: "backlog", priority: "normale", totalAmount: 120, dueDate: new Date(now.getTime() + 7 * 86400000), notes: "Targa personalizzata" },
    { clientName: "Romano Events", clientId: clients[2].id, status: "attesa", priority: "urgente", totalAmount: 890, dueDate: new Date(now.getTime() - 2 * 86400000), notes: "Allestimento stand fiera" },
    { clientName: "Luca Conti", clientId: clients[3].id, status: "done", priority: "normale", totalAmount: 75, dueDate: new Date(now.getTime() - 5 * 86400000) },
    { clientName: "Esposito Gioielli", clientId: clients[4].id, status: "delivered", priority: "alta", totalAmount: 1200, dueDate: new Date(now.getTime() - 10 * 86400000), notes: "Etichette gioielli serie A" },
  ];

  await Promise.all(orderData.map((o, i) =>
    prisma.order.create({ data: { ...o, userId: user.id, orderNumber: `ORD-2026-${String(i+1).padStart(3,"0")}`, synced: true } })
  ));

  // Seed sales
  const salesData = [
    { clientName: "Ferrari Design SRL", clientId: clients[0].id, subtotal: 450, taxAmount: 99, totalAmount: 549, status: "pagato", paidAt: new Date(now.getTime() - 5 * 86400000) },
    { clientName: "Romano Events", clientId: clients[2].id, subtotal: 890, taxAmount: 195.8, totalAmount: 1085.8, status: "da_pagare" },
    { clientName: "Esposito Gioielli", clientId: clients[4].id, subtotal: 1200, taxAmount: 264, totalAmount: 1464, status: "pagato", paidAt: new Date(now.getTime() - 15 * 86400000) },
    { clientName: "Marco Bianchi", clientId: clients[1].id, subtotal: 120, taxAmount: 26.4, totalAmount: 146.4, status: "bozza" },
    { clientName: "Luca Conti", clientId: clients[3].id, subtotal: 75, taxAmount: 16.5, totalAmount: 91.5, status: "pagato", paidAt: new Date(now.getTime() - 8 * 86400000) },
    { clientName: "Ferrari Design SRL", clientId: clients[0].id, subtotal: 320, taxAmount: 70.4, totalAmount: 390.4, status: "da_pagare" },
  ];

  await Promise.all(salesData.map((s, i) =>
    prisma.sale.create({ data: { ...s, userId: user.id, invoiceNumber: `FT-2026-${String(i+1).padStart(3,"0")}`, issueDate: new Date(now.getTime() - i * 3 * 86400000), synced: true } })
  ));

  // Seed cashflow
  const cashflowData = [
    { type: "entrata", amount: 1464, description: "Pagamento Esposito Gioielli", category: "vendite" },
    { type: "entrata", amount: 549, description: "Pagamento Ferrari Design", category: "vendite" },
    { type: "uscita", amount: 280, description: "Materiali MDF e acrilico", category: "materiali" },
    { type: "entrata", amount: 91.5, description: "Pagamento Luca Conti", category: "vendite" },
    { type: "uscita", amount: 120, description: "Manutenzione laser", category: "manutenzione" },
    { type: "uscita", amount: 450, description: "Affitto laboratorio", category: "affitto" },
    { type: "entrata", amount: 380, description: "Anticipo ordine cliente nuovo", category: "vendite" },
  ];

  await Promise.all(cashflowData.map((c, i) =>
    prisma.cashflowEntry.create({ data: { ...c, userId: user.id, date: new Date(now.getTime() - i * 2 * 86400000), synced: true } })
  ));

  // Seed products
  const productData = [
    { name: "Incisione Laser MDF", sku: "INC-MDF-01", category: "Incisioni", price: 25, cost: 8, unit: "pz", description: "Incisione su MDF fino a A4" },
    { name: "Taglio Acrilico", sku: "TAG-ACR-01", category: "Tagli", price: 35, cost: 12, unit: "m²", description: "Taglio precisione su acrilico" },
    { name: "Targa Personalizzata", sku: "TAR-PER-01", category: "Targhe", price: 45, cost: 15, unit: "pz" },
    { name: "Etichetta Gioielli", sku: "ETI-GIO-01", category: "Etichette", price: 2.5, cost: 0.8, unit: "pz" },
    { name: "Stampa UV Colore", sku: "STA-UV-01", category: "Stampe", price: 55, cost: 20, unit: "m²" },
    { name: "Incisione Pelle", sku: "INC-PEL-01", category: "Incisioni", price: 40, cost: 14, unit: "pz" },
  ];

  await Promise.all(productData.map((p) =>
    prisma.product.create({ data: { ...p, userId: user.id } })
  ));

  console.log("\n🎉 Seed completato!");
  console.log("═══════════════════════════════════════════");
  console.log("  🔑 CREDENZIALI DI ACCESSO");
  console.log("═══════════════════════════════════════════");
  console.log("  App:      http://localhost:3000");
  console.log("  Email:    mario@laserartstudio.it");
  console.log("  Password: Demo2026!");
  console.log("  Licenza:  INGLY-DEMO-2026");
  console.log("═══════════════════════════════════════════\n");
}

main().catch(console.error).finally(() => prisma.$disconnect());
