import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  // bcrypt-compatible hash (for dev seed only, real app uses bcrypt)
  return crypto
    .createHash("sha256")
    .update(password + "ingly_salt_dev")
    .digest("hex");
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── PLANS ──────────────────────────────────────────────────
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { slug: "starter" },
      create: {
        name: "Starter",
        slug: "starter",
        priceMonthly: 19,
        priceYearly: 190,
        maxUsers: 1,
        maxStorageGb: 2,
        aiTokensMonthly: 10000,
        modulesCount: 30,
        modulesList: [
          "dashboard","kpi","sales","clients","orders","quoter",
          "cashflow","catalog","materials","inventory","equipment",
          "projects","marketing","settings","backup","history",
          "workflow_dashboard","fixed_costs","suppliers","calendar",
          "team","imagelib","legal","brand_identity","reports",
          "stockalert","recurring","booking","finance","analytics"
        ],
        features: { excel_export: false, xml_sdi: false, api_access: false },
      },
      update: {},
    }),
    prisma.plan.upsert({
      where: { slug: "pro" },
      create: {
        name: "Pro",
        slug: "pro",
        priceMonthly: 49,
        priceYearly: 490,
        maxUsers: 3,
        maxStorageGb: 10,
        aiTokensMonthly: 100000,
        modulesCount: 60,
        modulesList: [
          "dashboard","kpi","sales","clients","orders","quoter","cashflow",
          "catalog","materials","inventory","equipment","projects","marketing",
          "settings","backup","history","workflow_dashboard","fixed_costs",
          "suppliers","calendar","team","imagelib","legal","brand_identity",
          "reports","stockalert","recurring","booking","finance","analytics",
          "crm","crm_pipeline","etsy_pulse","etsy_seo_wizard","socialstudio",
          "decision","briefing","ai","aicoach","forecasting","strategy",
          "innovation","items","paints","bu","timetracker","fiscal",
          "taxcalendar","pdfmonth","monthly_report","weeklyreport",
          "listino","template_docs","magazzino","lasercalc","inglydesign",
          "photostudio","ideas","goals","social_posts"
        ],
        features: { excel_export: true, xml_sdi: true, api_access: false },
      },
      update: {},
    }),
    prisma.plan.upsert({
      where: { slug: "business" },
      create: {
        name: "Business",
        slug: "business",
        priceMonthly: 99,
        priceYearly: 990,
        maxUsers: 10,
        maxStorageGb: 50,
        aiTokensMonthly: 500000,
        modulesCount: 85,
        features: { excel_export: true, xml_sdi: true, api_access: true, priority_support: true },
      },
      update: {},
    }),
    prisma.plan.upsert({
      where: { slug: "enterprise" },
      create: {
        name: "Enterprise",
        slug: "enterprise",
        priceMonthly: 199,
        priceYearly: 1990,
        maxUsers: -1,
        maxStorageGb: 200,
        aiTokensMonthly: -1,
        modulesCount: 113,
        features: {
          excel_export: true, xml_sdi: true, api_access: true,
          priority_support: true, white_label: true, custom_domain: true,
          sso_saml: true, dedicated_csm: true,
        },
      },
      update: {},
    }),
  ]);

  console.log(`✅ Piani creati: ${plans.map((p) => p.name).join(", ")}`);

  // ── SUPER ADMIN ─────────────────────────────────────────────
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: "superadmin@ingly.app" },
    create: {
      email: "superadmin@ingly.app",
      passwordHash: await hashPassword("Admin2026!"),
      fullName: "Super Admin",
      role: "superadmin",
    },
    update: {},
  });

  console.log(`✅ Super Admin: ${superAdmin.email} (password: Admin2026!)`);

  // ── DEMO TENANT ─────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-artigiano" },
    create: {
      slug: "demo-artigiano",
      companyName: "Laser Art di Mario Rossi",
      email: "mario@laserartstudio.it",
      phone: "+39 333 1234567",
      vatNumber: "IT12345678901",
      country: "IT",
      status: "active",
    },
    update: {},
  });

  // Piano Pro per demo
  const proPlan = plans.find((p) => p.slug === "pro")!;
  const sub = await prisma.subscription.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      tenantId: tenant.id,
      planId: proPlan.id,
      status: "active",
      billingCycle: "monthly",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    update: {},
  });

  await prisma.license.upsert({
    where: { licenseKey: "DEMO-PRO-2026-0001" },
    create: {
      tenantId: tenant.id,
      subscriptionId: sub.id,
      licenseKey: "DEMO-PRO-2026-0001",
      status: "active",
      maxDevices: 3,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    update: {},
  });

  // Utente owner del tenant demo
  const owner = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: "mario@laserartstudio.it" },
    },
    create: {
      tenantId: tenant.id,
      email: "mario@laserartstudio.it",
      username: "mario.rossi",
      passwordHash: await hashPassword("Demo2026!"),
      fullName: "Mario Rossi",
      firstName: "Mario",
      lastName: "Rossi",
      role: "owner",
      status: "active",
      emailVerified: true,
    },
    update: {},
  });

  console.log(`✅ Tenant demo: ${tenant.companyName}`);
  console.log(`✅ Utente demo: ${owner.email} (password: Demo2026!)`);

  // ── DATI DEMO: CLIENTI ───────────────────────────────────────
  const clientiDemo = [
    { firstName: "Anna", lastName: "Bianchi", email: "anna.bianchi@gmail.com", phone: "+39 347 1111111", type: "b2c", city: "Milano", totalRevenue: 850.00, ordersCount: 5 },
    { firstName: "Carlo", lastName: "Verdi", email: "carlo.verdi@studio.it", phone: "+39 335 2222222", type: "b2c", city: "Roma", totalRevenue: 1200.00, ordersCount: 8 },
    { companyName: "TechnoLaser Srl", email: "ordini@technolaser.it", phone: "+39 02 1234567", type: "b2b", city: "Torino", vatNumber: "IT98765432101", totalRevenue: 4500.00, ordersCount: 15 },
    { firstName: "Laura", lastName: "Neri", email: "laura.neri@outlook.com", phone: "+39 333 3333333", type: "b2c", city: "Firenze", totalRevenue: 320.00, ordersCount: 3 },
    { companyName: "Gadget & Co.", email: "acquisti@gadgetco.it", phone: "+39 011 9876543", type: "b2b", city: "Genova", vatNumber: "IT11223344001", totalRevenue: 2800.00, ordersCount: 12 },
  ];

  for (const c of clientiDemo) {
    await prisma.client.create({
      data: { tenantId: tenant.id, createdBy: owner.id, ...c } as any,
    });
  }

  console.log(`✅ Clienti demo: ${clientiDemo.length}`);

  // ── DATI DEMO: ORDINI ───────────────────────────────────────
  const ordiniDemo = [
    { orderNumber: "ORD-2026-001", clientName: "Anna Bianchi", status: "working", priority: "high", totalAmount: 85.00, notes: "Tagliere in legno personalizzato - nome + data matrimonio", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { orderNumber: "ORD-2026-002", clientName: "TechnoLaser Srl", status: "backlog", priority: "normal", totalAmount: 450.00, notes: "50 portachiavi plexiglass con logo aziendale", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { orderNumber: "ORD-2026-003", clientName: "Carlo Verdi", status: "done", priority: "normal", totalAmount: 120.00, notes: "3 quadri in legno MDF con incisione", dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { orderNumber: "ORD-2026-004", clientName: "Gadget & Co.", status: "backlog", priority: "urgent", totalAmount: 890.00, notes: "100 targhe metallo con personalizzazione", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { orderNumber: "ORD-2026-005", clientName: "Laura Neri", status: "delivered", priority: "low", totalAmount: 65.00, notes: "Cornice foto personalizzata compleanno", dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  ];

  for (const o of ordiniDemo) {
    await prisma.order.create({
      data: { tenantId: tenant.id, createdBy: owner.id, currency: "EUR", ...o },
    });
  }

  console.log(`✅ Ordini demo: ${ordiniDemo.length}`);

  // ── DATI DEMO: VENDITE ──────────────────────────────────────
  const venditeDemo = [
    { invoiceNumber: "FT-2026-001", clientName: "Anna Bianchi", status: "pagato", totalAmount: 150.00, taxRate: 22, taxAmount: 27.05, subtotal: 122.95, paymentMethod: "Bonifico", paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { invoiceNumber: "FT-2026-002", clientName: "TechnoLaser Srl", status: "pagato", totalAmount: 610.00, taxRate: 22, taxAmount: 110.00, subtotal: 500.00, paymentMethod: "Bonifico", paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { invoiceNumber: "FT-2026-003", clientName: "Carlo Verdi", status: "da_pagare", totalAmount: 244.00, taxRate: 22, taxAmount: 44.00, subtotal: 200.00, paymentMethod: "Contanti" },
    { invoiceNumber: "FT-2026-004", clientName: "Gadget & Co.", status: "pagato", totalAmount: 1098.00, taxRate: 22, taxAmount: 198.00, subtotal: 900.00, paymentMethod: "Bonifico", paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { invoiceNumber: "FT-2026-005", clientName: "Laura Neri", status: "pagato", totalAmount: 79.30, taxRate: 22, taxAmount: 14.30, subtotal: 65.00, paymentMethod: "Carta", paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { invoiceNumber: "FT-2026-006", clientName: "Anna Bianchi", status: "da_pagare", totalAmount: 103.70, taxRate: 22, taxAmount: 18.70, subtotal: 85.00, paymentMethod: "Bonifico" },
  ];

  for (const v of venditeDemo) {
    await prisma.sale.create({
      data: { tenantId: tenant.id, createdBy: owner.id, currency: "EUR", ...v } as any,
    });
  }

  console.log(`✅ Vendite demo: ${venditeDemo.length}`);

  // ── DATI DEMO: CASHFLOW ─────────────────────────────────────
  const cashflowDemo = [
    { type: "entrata", category: "Vendite", description: "Pagamento FT-2026-002", amount: 610.00, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { type: "entrata", category: "Vendite", description: "Pagamento FT-2026-004", amount: 1098.00, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { type: "uscita", category: "Materiali", description: "Acquisto legno MDF 3mm - 20 fogli", amount: 87.50, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
    { type: "uscita", category: "Costi fissi", description: "Affitto laboratorio Giugno 2026", amount: 650.00, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { type: "uscita", category: "Attrezzature", description: "Manutenzione laser CO2", amount: 120.00, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    { type: "entrata", category: "Vendite", description: "Pagamento FT-2026-001", amount: 150.00, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { type: "uscita", category: "Marketing", description: "Campagna Instagram Ads", amount: 50.00, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  ];

  for (const c of cashflowDemo) {
    await prisma.cashflowEntry.create({
      data: { tenantId: tenant.id, createdBy: owner.id, currency: "EUR", paymentMethod: "Bonifico", ...c } as any,
    });
  }

  console.log(`✅ Cashflow demo: ${cashflowDemo.length}`);

  // ── DATI DEMO: PRODOTTI ─────────────────────────────────────
  const prodotti = [
    { name: "Tagliere Legno Personalizzato", category: "Legno", material: "Faggio", costPrice: 8.50, salePrice: 35.00, unit: "pz", isCustomizable: true },
    { name: "Portachiavi Plexiglass", category: "Plexiglass", material: "Plexi 3mm", costPrice: 1.20, salePrice: 8.00, unit: "pz", isCustomizable: true },
    { name: "Targa Metallo", category: "Metallo", material: "Alluminio anodizzato", costPrice: 4.50, salePrice: 18.00, unit: "pz", isCustomizable: true },
    { name: "Quadro MDF 30x40", category: "Legno", material: "MDF 5mm", costPrice: 6.00, salePrice: 45.00, unit: "pz", isCustomizable: true },
    { name: "Cornice Foto Personalizzata", category: "Legno", material: "Pioppo 4mm", costPrice: 5.50, salePrice: 28.00, unit: "pz", isCustomizable: true },
    { name: "Segnalibro Acrilico", category: "Plexiglass", material: "Plexi trasparente 2mm", costPrice: 0.80, salePrice: 5.00, unit: "pz", isCustomizable: true },
  ];

  for (const p of prodotti) {
    await prisma.product.create({
      data: { tenantId: tenant.id, createdBy: owner.id, currency: "EUR", tags: ["laser", "personalizzato"], ...p },
    });
  }

  console.log(`✅ Prodotti demo: ${prodotti.length}`);

  // ── NOTIFICHE DEMO ──────────────────────────────────────────
  await prisma.notification.create({
    data: {
      tenantId: tenant.id,
      userId: owner.id,
      type: "order_overdue",
      title: "⚠️ Ordine ORD-2026-003 in ritardo",
      body: "L'ordine di Carlo Verdi era in scadenza ieri. Aggiorna lo stato.",
      data: { orderId: "ORD-2026-003" },
    },
  });

  await prisma.notification.create({
    data: {
      tenantId: tenant.id,
      userId: owner.id,
      type: "payment_received",
      title: "✅ Pagamento ricevuto €1.098",
      body: "Gadget & Co. ha pagato la fattura FT-2026-004.",
      isRead: true,
      readAt: new Date(),
      data: { invoiceId: "FT-2026-004" },
    },
  });

  console.log("✅ Notifiche demo create");

  console.log("\n🎉 Seed completato!\n");
  console.log("═══════════════════════════════════════════");
  console.log("  🔑 CREDENZIALI DI ACCESSO");
  console.log("═══════════════════════════════════════════");
  console.log("  App:        http://localhost:3000");
  console.log("  Admin:      http://localhost:3000/admin");
  console.log("  API:        http://localhost:4000");
  console.log("  DB Admin:   http://localhost:8080");
  console.log("  MinIO:      http://localhost:9001");
  console.log("───────────────────────────────────────────");
  console.log("  UTENTE DEMO:");
  console.log("  Email:      mario@laserartstudio.it");
  console.log("  Password:   Demo2026!");
  console.log("───────────────────────────────────────────");
  console.log("  SUPER ADMIN:");
  console.log("  Email:      superadmin@ingly.app");
  console.log("  Password:   Admin2026!");
  console.log("═══════════════════════════════════════════\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
