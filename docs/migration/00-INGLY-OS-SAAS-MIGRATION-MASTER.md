# INGLY OS — Migrazione a SaaS Enterprise Cloud
## Piano Maestro Completo · v1.0 · Giugno 2026

---

## INDICE

1. [Analisi Sistema Attuale](#1-analisi-sistema-attuale)
2. [Domain Driven Design](#2-domain-driven-design)
3. [Architettura Target](#3-architettura-target)
4. [Schema Database PostgreSQL](#4-schema-database-postgresql)
5. [Schema API REST](#5-schema-api-rest)
6. [Architettura Frontend](#6-architettura-frontend)
7. [Architettura Backend](#7-architettura-backend)
8. [Admin Panel Enterprise](#8-admin-panel-enterprise)
9. [Sistema Billing & Abbonamenti](#9-sistema-billing--abbonamenti)
10. [Sistema Licenze & Device Management](#10-sistema-licenze--device-management)
11. [Multi-Tenancy](#11-multi-tenancy)
12. [Sicurezza Enterprise](#12-sicurezza-enterprise)
13. [Testing Strategy](#13-testing-strategy)
14. [DevOps & Infrastruttura](#14-devops--infrastruttura)
15. [Roadmap Implementazione](#15-roadmap-implementazione)
16. [Struttura Repository](#16-struttura-repository)
17. [Stima Tempi & Costi](#17-stima-tempi--costi)

---

## 1. ANALISI SISTEMA ATTUALE

### 1.1 Caratteristiche Tecniche

| Caratteristica | Valore |
|---|---|
| Tipo file | Single HTML monolitico |
| Dimensione | ~6.2 MB (97.800+ righe) |
| Linguaggio | HTML + CSS + JavaScript vanilla |
| Storage primario | IndexedDB (InglyMasterDB v30) |
| Storage secondario | localStorage (`ingly_saas_db`) |
| Sessioni | sessionStorage (`ingly_saas_session`) |
| Sincronizzazione | BroadcastChannel API + polling ogni 3s |
| AI integration | Chiavi API client-side (criptate base64) |
| PDF generation | jsPDF + html2canvas client-side |
| Excel export | SheetJS client-side |
| Charts | Chart.js 4.4 |
| Icons | FontAwesome 6.5 + Lucide + Phosphor + Tabler + Remix |
| Admin Panel | File HTML separato (3.288 righe) |
| Lingua UI | Italiano |

### 1.2 Dipendenze Esterne (CDN)

```
chart.js 4.4.1
jspdf 2.5.1
html2canvas 1.4.1
xlsx 0.18.5
jspdf-autotable 3.8.2
font-awesome 6.5.0
lucide-static 0.441.0
@phosphor-icons/web 2.1.1
@tabler/icons-webfont 3.17.0
remixicon 4.3.0
```

### 1.3 Moduli Identificati (113 sezioni totali)

#### CORE BUSINESS
| ID Sezione | Nome | Categoria |
|---|---|---|
| `dashboard` | Dashboard principale | Core |
| `kpi` | KPI Live | Analytics |
| `briefing` | Morning Briefing AI | AI |
| `decision` | AI Decisioni | AI |
| `ai` | AI Hub | AI |
| `aicoach` | AI Coach | AI |

#### VENDITE & FINANZA
| ID Sezione | Nome | Categoria |
|---|---|---|
| `sales` | Vendite & Fatture | Finance |
| `sales_archive` | Archivio Vendite | Finance |
| `cashflow` | Cashflow | Finance |
| `prima_nota` | Prima Nota | Finance |
| `finance` | Finance Pro | Finance |
| `fiscal` | Fiscale | Finance |
| `forecasting` | Forecasting | Finance |
| `forecaster` | Financial Forecaster | AI/Finance |
| `recurring` | Fatture Ricorrenti | Finance |
| `payment_schedule` | Piano Pagamenti | Finance |
| `pdfmonth` | Report PDF Mensile | Finance |
| `monthly_report` | Report Mensile | Finance |
| `weeklyreport` | Report Settimanale | Finance |
| `reports` | Report | Finance |
| `revsim` | Revenue Simulator | Finance |
| `taxcalendar` | Calendario Fiscale | Finance |
| `xmlsdi` | XML SDI Fatture | Finance |

#### ORDINI & PRODUZIONE
| ID Sezione | Nome | Categoria |
|---|---|---|
| `workflow_dashboard` | Workflow Dashboard | Production |
| `gestione_ordini` | Gestione Ordini | Production |
| `order_tracker` | Order Tracker | Production |
| `quoter` | Smart Quoter | Sales |
| `quick_quote` | Quick Quote | Sales |
| `quotes` | Preventivi | Sales |
| `booking` | Booking | Sales |
| `crm_pipeline` | CRM Pipeline | CRM |
| `lasercalc` | Laser Calc | Tools |

#### CRM & CLIENTI
| ID Sezione | Nome | Categoria |
|---|---|---|
| `clients` | Clienti | CRM |
| `clienti` | Gestione Clienti | CRM |
| `crm` | CRM Pro | CRM |
| `clientintel` | Client Intelligence | AI/CRM |
| `leadscorer` | Lead Scorer | AI/CRM |
| `clv` | Customer Lifetime Value | Analytics |

#### MAGAZZINO & MATERIALI
| ID Sezione | Nome | Categoria |
|---|---|---|
| `magazzino` | Magazzino | Inventory |
| `inventory` | Inventario | Inventory |
| `items` | Articoli | Inventory |
| `materials` | Materiali | Inventory |
| `stockalert` | Stock Alert | Inventory |
| `stockplanner` | Stock Planner | Inventory |
| `suppliers` | Fornitori | Inventory |
| `supplierintel` | Supplier Intelligence | AI/Inventory |
| `paints` | Vernici | Inventory |
| `barcode` | Barcode/QR | Tools |
| `scanner` | Scanner | Tools |

#### CATALOGO & PRODOTTI
| ID Sezione | Nome | Categoria |
|---|---|---|
| `catalog` | Catalogo | Products |
| `listino` | Listino B2B | Products |
| `template_docs` | Template Documenti | Templates |
| `dynamicprice` | Dynamic Pricing | Products |
| `price_radar` | Price Radar | Products |
| `profitscope` | Profit Scope | Products |
| `product_hunter` | Product Hunter | AI/Products |

#### MARKETING & SOCIAL
| ID Sezione | Nome | Categoria |
|---|---|---|
| `marketing` | Marketing | Marketing |
| `socialstudio` | Social Studio | Marketing |
| `etsy_pulse` | Etsy Pulse | Marketing |
| `etsy_seo_wizard` | Etsy SEO Wizard | Marketing |
| `etsyai` | Etsy AI | AI/Marketing |
| `contentperf` | Content Performance | Analytics |
| `socialproof` | Social Proof | Marketing |
| `replyai` | Reply AI | AI |
| `trendscanner` | Trend Scanner | AI/Marketing |
| `market_intel` | Market Intelligence | Analytics |
| `marketintel` | Market Intel | Analytics |
| `market_agent` | Market Agent | AI |
| `competitors` | Competitor Monitor | Analytics |
| `competitormon` | Competitor Monitor v2 | Analytics |

#### PROGETTI & DESIGN
| ID Sezione | Nome | Categoria |
|---|---|---|
| `projects` | Progetti | Projects |
| `inglydesign` | Ingly Design | Design |
| `imagelib` | Libreria Immagini | Storage |
| `photostudio` | Photo Studio | Design |
| `ideas` | Idee & Ispirazione | Projects |
| `innovation` | Innovazione | Strategy |

#### ANALYTICS & INTELLIGENCE
| ID Sezione | Nome | Categoria |
|---|---|---|
| `analytics` | Analytics | Analytics |
| `ai-dashboard` | AI Dashboard | AI/Analytics |
| `ai-predictor` | AI Predictor | AI |
| `ai-anomaly` | AI Anomaly Detection | AI |
| `ai-clv` | AI CLV | AI |
| `ai-reorder` | AI Reorder | AI |
| `bizai` | Business AI | AI |
| `demand_map` | Demand Map | Analytics |
| `opportunity` | Opportunity Finder | AI |
| `quoteintel` | Quote Intelligence | AI |
| `growthengine` | Growth Engine | AI |

#### BUSINESS & STRATEGIA
| ID Sezione | Nome | Categoria |
|---|---|---|
| `strategy` | Strategia | Strategy |
| `goals` | Obiettivi | Strategy |
| `bu` | Business Unit | Strategy |
| `b2bpitch` | B2B Pitch | Strategy |
| `fiera` | Fiera | Strategy |
| `laser_b2b` | Laser B2B | Strategy |

#### TEAM & HR
| ID Sezione | Nome | Categoria |
|---|---|---|
| `team` | Team | HR |
| `timetracker` | Time Tracker | HR |
| `live_intel` | Live Intel | HR |

#### ATTREZZATURE & INFRASTRUTTURA
| ID Sezione | Nome | Categoria |
|---|---|---|
| `equipment` | Attrezzature | Equipment |
| `fixed_costs` | Costi Fissi | Finance |
| `lab_setup` | Lab Setup | Equipment |
| `lab_musthave` | Lab Must Have | Equipment |
| `laserresources` | Laser Resources | Equipment |
| `print3d` | Stampa 3D | Equipment |
| `apparel` | Abbigliamento | Products |

#### ADMIN & SISTEMA
| ID Sezione | Nome | Categoria |
|---|---|---|
| `settings` | Impostazioni | Settings |
| `brand_identity` | Brand Identity | Settings |
| `backup` | Backup | System |
| `portabile` | Esporta Portatile | System |
| `history` | Storico | System |
| `cloud_updater` | Cloud Updater | System |
| `smartnotif` | Smart Notifiche | System |
| `legal` | Legale | Legal |

### 1.4 Database Stores (IndexedDB)

```
sales           — Vendite/fatture
clients         — Clienti
quotes          — Preventivi
cashflow        — Cashflow
orders          — Ordini produzione
materials       — Materiali
pipeline        — CRM pipeline
equipment       — Attrezzature
catalog         — Catalogo prodotti
inventory       — Inventario
image_lib       — Libreria immagini
items           — Articoli magazzino
products        — Prodotti
ideas           — Idee
suppliers       — Fornitori
paints          — Vernici
projects        — Progetti
social_posts    — Post social
```

### 1.5 Piani Abbonamento Esistenti

| Piano | Prezzo | Moduli | Storage | AI Token/mese |
|---|---|---|---|---|
| Starter | €19/mese | 30 | 2 GB | 10.000 |
| Pro | €49/mese | 60 | 10 GB | 100.000 |
| Business | €99/mese | 85 | 50 GB | 500.000 |
| Enterprise | €199/mese | 113 (tutti) | 200 GB | Illimitati |

### 1.6 Funzionalità Admin Panel Attuale

- Gestione utenti (crea, modifica, sospendi, banna)
- Assegnazione piani
- Force logout remoto
- Reset password
- Sync in tempo reale via BroadcastChannel (entro 3 secondi)
- Device fingerprint (canvas + WebGL + timezone + CPU hash)
- Enterprise Dashboard live (Ctrl+Shift+D)
- KPI: utenti online/attivi/scaduti, MRR, progetti, token AI, storage, security alerts

### 1.7 Criticità Architetturali Attuali

| Problema | Impatto | Priorità |
|---|---|---|
| Dati nel browser (IndexedDB/localStorage) | Perdita dati, nessun backup reale | CRITICA |
| Chiavi API AI in localStorage (base64) | Security breach | CRITICA |
| Sync via BroadcastChannel (stesso browser) | Non funziona tra device diversi | ALTA |
| Nessun server backend | Impossibile multi-device | ALTA |
| File HTML 6.2MB | Performance, manutenibilità | ALTA |
| Nessun sistema di autenticazione reale | JWT/session non sicuri | ALTA |
| CORS e API calls client-side | Esposizione chiavi | ALTA |
| Nessun audit log server-side | Compliance, debugging | MEDIA |
| Nessun backup automatico | Rischio perdita dati | MEDIA |
| Zero test automatizzati | Regressioni non rilevate | MEDIA |

---

## 2. DOMAIN DRIVEN DESIGN

### 2.1 Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────┐
│                    INGLY OS — DOMINI                            │
├─────────────────┬──────────────────┬──────────────────────────  │
│   IDENTITY      │   COMMERCE       │   PRODUCTION               │
│                 │                  │                            │
│ • Authentication│ • Sales          │ • Orders                   │
│ • Users         │ • Invoices       │ • Workflow                 │
│ • Sessions      │ • Cashflow       │ • Projects                 │
│ • Devices       │ • Quotes         │ • Equipment                │
│ • RBAC          │ • Booking        │ • Materials                │
│ • MFA           │ • Recurring      │ • Inventory                │
├─────────────────┼──────────────────┼──────────────────────────  │
│   CRM           │   CATALOG        │   INTELLIGENCE             │
│                 │                  │                            │
│ • Clients       │ • Products       │ • AI Engine                │
│ • Pipeline      │ • Templates      │ • Analytics                │
│ • Lead Scoring  │ • Pricing        │ • Forecasting              │
│ • CLV           │ • Categories     │ • Anomaly Detection        │
│ • Segmentation  │ • Image Library  │ • Market Intel             │
├─────────────────┼──────────────────┼──────────────────────────  │
│   MARKETING     │   ADMIN          │   PLATFORM                 │
│                 │                  │                            │
│ • Social Hub    │ • User Mgmt      │ • Billing                  │
│ • Etsy/SEO      │ • Licenses       │ • Subscriptions            │
│ • Content       │ • Audit Logs     │ • Notifications            │
│ • Campaigns     │ • Security       │ • Storage                  │
│ • Competitors   │ • Settings       │ • Backup                   │
└─────────────────┴──────────────────┴──────────────────────────  ┘
```

### 2.2 Aggregates per Dominio

**Identity Domain**
```
User (aggregate root)
  └── Session[]
  └── Device[]
  └── MFAConfig
  └── PasswordHistory[]

Role (aggregate root)
  └── Permission[]
```

**Commerce Domain**
```
Sale (aggregate root)
  └── LineItem[]
  └── Payment
  └── Invoice (PDF)

Quote (aggregate root)
  └── QuoteItem[]
  └── Template

CashflowEntry (aggregate root)
  └── Category
  └── Attachment
```

**Production Domain**
```
Order (aggregate root)
  └── OrderItem[]
  └── StatusHistory[]
  └── ProductionNote[]

Project (aggregate root)
  └── ProjectVersion[]
  └── ProjectFile[]
  └── Collaborator[]
```

**CRM Domain**
```
Client (aggregate root)
  └── ContactInfo[]
  └── Note[]
  └── Tag[]
  └── InteractionHistory[]

PipelineStage (value object)
Deal (aggregate root)
  └── Activity[]
```

**Catalog Domain**
```
Product (aggregate root)
  └── Variant[]
  └── PriceHistory[]
  └── Image[]

Template (aggregate root)
  └── TemplateVersion[]
  └── Variable[]
```

**Platform Domain**
```
Tenant (aggregate root)
  └── Subscription
  └── License
  └── StorageQuota

Subscription (aggregate root)
  └── Plan
  └── Payment[]
  └── Invoice[]
```

---

## 3. ARCHITETTURA TARGET

### 3.1 Stack Tecnologico

```
┌──────────────────────────────────────────────────────────────┐
│                      CDN / Edge (Cloudflare)                  │
├──────────────────────────────────────────────────────────────┤
│                   FRONTEND (Vercel)                           │
│  Next.js 15 · React 19 · TypeScript · Tailwind · Shadcn UI  │
├────────────────┬─────────────────┬───────────────────────────┤
│  API GATEWAY   │   AUTH SERVICE  │   WEBSOCKET GATEWAY       │
│  (Kong/Nginx)  │   (Keycloak /   │   (Socket.io)             │
│                │    custom JWT)  │                           │
├────────────────┴─────────────────┴───────────────────────────┤
│                   MICROSERVICES (Node.js / Fastify)           │
│                                                              │
│  identity-api  │ commerce-api  │ production-api              │
│  crm-api       │ catalog-api   │ intelligence-api            │
│  marketing-api │ admin-api     │ billing-api                 │
│  storage-api   │ notification-api                            │
├──────────────────────────────────────────────────────────────┤
│                    MESSAGE QUEUE                              │
│              BullMQ + Redis (job processing)                  │
├──────────────────────────────────────────────────────────────┤
│                    CACHE LAYER                                │
│                  Redis (session, KV cache)                    │
├────────────────────┬─────────────────────────────────────────┤
│  PRIMARY DATABASE  │   OBJECT STORAGE                        │
│  PostgreSQL 16     │   S3-compatible (MinIO / Cloudflare R2) │
│  (RDS / Supabase)  │                                         │
├────────────────────┴─────────────────────────────────────────┤
│                    MONITORING                                 │
│         Grafana · Prometheus · Sentry · OpenTelemetry        │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Flusso Dati

```
Browser → Cloudflare CDN → Next.js (SSR/SSG)
                                ↓
                         API Gateway (Kong)
                         ├─ Rate Limiting
                         ├─ Auth Middleware (JWT verify)
                         ├─ Tenant Isolation
                         └─ Route to microservice
                                ↓
                    Microservice (Fastify)
                    ├─ Business Logic
                    ├─ Redis Cache check
                    ├─ PostgreSQL query (tenant schema)
                    ├─ S3 (file ops)
                    └─ BullMQ (async jobs)
                                ↓
                         Response → Browser
```

### 3.3 Multi-Tenancy Strategy

**Schema-per-Tenant** (PostgreSQL)
- Ogni tenant ottiene il proprio schema PostgreSQL: `tenant_{tenant_id}`
- Schema condiviso `public` per: piani, licenze, billing, lookup tables
- Row-Level Security (RLS) come seconda linea di difesa
- Vantaggi: isolamento dati garantito, facile backup per tenant, GDPR compliant

---

## 4. SCHEMA DATABASE POSTGRESQL

### 4.1 Schema Pubblico (Condiviso)

```sql
-- ============================================================
-- SCHEMA: public (piattaforma, billing, admin)
-- ============================================================

-- TENANTS (aziende cliente)
CREATE TABLE public.tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(63) UNIQUE NOT NULL,          -- subdomain
  company_name  VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(50),
  vat_number    VARCHAR(50),
  country       CHAR(2) DEFAULT 'IT',
  timezone      VARCHAR(50) DEFAULT 'Europe/Rome',
  locale        VARCHAR(10) DEFAULT 'it-IT',
  logo_url      TEXT,
  status        VARCHAR(20) DEFAULT 'active'
                CHECK (status IN ('active','suspended','banned','trial','churned')),
  trial_ends_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- PIANI
CREATE TABLE public.plans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                VARCHAR(50) NOT NULL,             -- Starter, Pro, Business, Enterprise
  slug                VARCHAR(50) UNIQUE NOT NULL,
  price_monthly       DECIMAL(10,2) NOT NULL,
  price_yearly        DECIMAL(10,2),
  currency            CHAR(3) DEFAULT 'EUR',
  max_users           INTEGER DEFAULT 1,
  max_storage_gb      INTEGER DEFAULT 2,
  ai_tokens_monthly   INTEGER DEFAULT 10000,           -- -1 = unlimited
  modules_count       INTEGER DEFAULT 30,
  modules_list        JSONB DEFAULT '[]',               -- array of module IDs
  features            JSONB DEFAULT '{}',               -- feature flags
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id),
  plan_id           UUID NOT NULL REFERENCES public.plans(id),
  status            VARCHAR(20) DEFAULT 'active'
                    CHECK (status IN ('trialing','active','past_due','canceled','unpaid')),
  billing_cycle     VARCHAR(10) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end   TIMESTAMPTZ NOT NULL,
  canceled_at       TIMESTAMPTZ,
  cancel_at         TIMESTAMPTZ,
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id     VARCHAR(100),
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id),
  subscription_id   UUID REFERENCES public.subscriptions(id),
  amount            DECIMAL(10,2) NOT NULL,
  currency          CHAR(3) DEFAULT 'EUR',
  status            VARCHAR(20) CHECK (status IN ('pending','succeeded','failed','refunded')),
  payment_method    VARCHAR(50),
  stripe_payment_intent_id VARCHAR(100),
  stripe_invoice_id        VARCHAR(100),
  invoice_url       TEXT,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES
CREATE TABLE public.invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id),
  payment_id        UUID REFERENCES public.payments(id),
  invoice_number    VARCHAR(50) UNIQUE NOT NULL,
  amount            DECIMAL(10,2) NOT NULL,
  tax_amount        DECIMAL(10,2) DEFAULT 0,
  total_amount      DECIMAL(10,2) NOT NULL,
  currency          CHAR(3) DEFAULT 'EUR',
  status            VARCHAR(20) CHECK (status IN ('draft','sent','paid','void')),
  due_date          DATE,
  pdf_url           TEXT,
  stripe_invoice_id VARCHAR(100),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- GLOBAL ADMIN USERS
CREATE TABLE public.admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  role          VARCHAR(30) DEFAULT 'admin'
                CHECK (role IN ('superadmin','admin','support','billing','readonly')),
  is_active     BOOLEAN DEFAULT true,
  mfa_secret    VARCHAR(100),
  mfa_enabled   BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN ACTIONS LOG
CREATE TABLE public.admin_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID NOT NULL REFERENCES public.admin_users(id),
  tenant_id     UUID REFERENCES public.tenants(id),
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(50),
  entity_id     UUID,
  before_state  JSONB,
  after_state   JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- LICENSES
CREATE TABLE public.licenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id),
  license_key     VARCHAR(100) UNIQUE NOT NULL,
  status          VARCHAR(20) DEFAULT 'active'
                  CHECK (status IN ('active','suspended','revoked','expired')),
  max_devices     INTEGER DEFAULT 3,
  valid_from      TIMESTAMPTZ NOT NULL,
  valid_until     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- DEVICES
CREATE TABLE public.devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id      UUID NOT NULL REFERENCES public.licenses(id),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  user_id         UUID NOT NULL,                        -- riferimento a tenant schema
  fingerprint     VARCHAR(255) NOT NULL,
  device_name     VARCHAR(100),
  device_type     VARCHAR(50),
  browser         VARCHAR(50),
  os              VARCHAR(50),
  ip_address      INET,
  last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  is_trusted      BOOLEAN DEFAULT false,
  is_blocked      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT TICKETS
CREATE TABLE public.support_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  user_id         UUID,
  assigned_to     UUID REFERENCES public.admin_users(id),
  subject         VARCHAR(255) NOT NULL,
  description     TEXT,
  priority        VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status          VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  tags            TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- PLAN FEATURES (feature flags per piano)
INSERT INTO public.plans (name, slug, price_monthly, price_yearly, max_users, max_storage_gb, ai_tokens_monthly, modules_count) VALUES
  ('Starter',    'starter',    19,   190,  1,   2,   10000,    30),
  ('Pro',        'pro',        49,   490,  3,   10,  100000,   60),
  ('Business',   'business',   99,   990,  10,  50,  500000,   85),
  ('Enterprise', 'enterprise', 199, 1990,  -1,  200, -1,       113);
```

### 4.2 Schema per Tenant

```sql
-- ============================================================
-- SCHEMA: tenant_{tenant_id} (dati isolati per cliente)
-- ============================================================
-- Nota: generato dinamicamente al provisioning del tenant

-- USERS (utenti del tenant)
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  email           VARCHAR(255) NOT NULL,
  username        VARCHAR(100) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  avatar_url      TEXT,
  phone           VARCHAR(50),
  role            VARCHAR(30) DEFAULT 'user'
                  CHECK (role IN ('owner','admin','manager','user','viewer')),
  status          VARCHAR(20) DEFAULT 'active'
                  CHECK (status IN ('active','inactive','suspended')),
  plan_override   VARCHAR(50),                          -- override piano per utente
  modules_allowed JSONB DEFAULT '[]',                   -- moduli abilitati
  preferences     JSONB DEFAULT '{}',
  mfa_secret      VARCHAR(100),
  mfa_enabled     BOOLEAN DEFAULT false,
  email_verified  BOOLEAN DEFAULT false,
  last_login_at   TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email),
  UNIQUE(username)
);

-- SESSIONS
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token   VARCHAR(512) UNIQUE NOT NULL,
  device_id       UUID,
  ip_address      INET,
  user_agent      TEXT,
  expires_at      TIMESTAMPTZ NOT NULL,
  last_activity   TIMESTAMPTZ DEFAULT NOW(),
  is_revoked      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  entity_type     VARCHAR(50) NOT NULL,
  entity_id       UUID,
  action          VARCHAR(50) NOT NULL,
  changes         JSONB DEFAULT '{}',
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTS (clienti dell'artigiano)
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(20) UNIQUE,
  company_name    VARCHAR(255),
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  email           VARCHAR(255),
  phone           VARCHAR(50),
  mobile          VARCHAR(50),
  address         TEXT,
  city            VARCHAR(100),
  zip_code        VARCHAR(20),
  country         CHAR(2) DEFAULT 'IT',
  vat_number      VARCHAR(50),
  fiscal_code     VARCHAR(20),
  sdi_code        VARCHAR(10),
  pec_email       VARCHAR(255),
  type            VARCHAR(20) DEFAULT 'b2c' CHECK (type IN ('b2b','b2c')),
  segment         VARCHAR(50),
  tags            TEXT[],
  notes           TEXT,
  source          VARCHAR(50),
  is_active       BOOLEAN DEFAULT true,
  total_revenue   DECIMAL(12,2) DEFAULT 0,
  orders_count    INTEGER DEFAULT 0,
  last_order_at   TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS / CATALOG
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             VARCHAR(100) UNIQUE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  category        VARCHAR(100),
  subcategory     VARCHAR(100),
  type            VARCHAR(50),
  material        VARCHAR(100),
  cost_price      DECIMAL(10,2) DEFAULT 0,
  sale_price      DECIMAL(10,2) DEFAULT 0,
  min_price       DECIMAL(10,2) DEFAULT 0,
  currency        CHAR(3) DEFAULT 'EUR',
  unit            VARCHAR(20) DEFAULT 'pz',
  images          JSONB DEFAULT '[]',
  tags            TEXT[],
  is_active       BOOLEAN DEFAULT true,
  is_customizable BOOLEAN DEFAULT false,
  lead_time_days  INTEGER DEFAULT 0,
  weight_grams    INTEGER DEFAULT 0,
  dimensions      JSONB DEFAULT '{}',
  metadata        JSONB DEFAULT '{}',
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- INVENTORY ITEMS
CREATE TABLE inventory_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id),
  sku             VARCHAR(100),
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100),
  unit            VARCHAR(20) DEFAULT 'pz',
  quantity        DECIMAL(10,3) DEFAULT 0,
  min_quantity    DECIMAL(10,3) DEFAULT 2,
  reorder_point   DECIMAL(10,3) DEFAULT 5,
  unit_cost       DECIMAL(10,2) DEFAULT 0,
  location        VARCHAR(100),
  supplier_id     UUID,
  barcode         VARCHAR(100),
  notes           TEXT,
  last_restocked_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- MATERIALS
CREATE TABLE materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  type            VARCHAR(50),
  supplier        VARCHAR(255),
  unit            VARCHAR(20) DEFAULT 'pz',
  quantity        DECIMAL(10,3) DEFAULT 0,
  min_quantity    DECIMAL(10,3) DEFAULT 1,
  unit_cost       DECIMAL(10,2) DEFAULT 0,
  notes           TEXT,
  color           VARCHAR(50),
  thickness_mm    DECIMAL(6,2),
  dimensions      JSONB DEFAULT '{}',
  tags            TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPLIERS
CREATE TABLE suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  contact_name    VARCHAR(255),
  email           VARCHAR(255),
  phone           VARCHAR(50),
  website         TEXT,
  address         TEXT,
  vat_number      VARCHAR(50),
  payment_terms   INTEGER DEFAULT 30,
  currency        CHAR(3) DEFAULT 'EUR',
  rating          SMALLINT DEFAULT 3 CHECK (rating BETWEEN 1 AND 5),
  notes           TEXT,
  tags            TEXT[],
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTES (Preventivi)
CREATE TABLE quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number    VARCHAR(50) UNIQUE NOT NULL,
  client_id       UUID REFERENCES clients(id),
  client_name     VARCHAR(255),
  status          VARCHAR(20) DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  items           JSONB DEFAULT '[]',
  subtotal        DECIMAL(12,2) DEFAULT 0,
  tax_rate        DECIMAL(5,2) DEFAULT 22,
  tax_amount      DECIMAL(12,2) DEFAULT 0,
  discount        DECIMAL(10,2) DEFAULT 0,
  total_amount    DECIMAL(12,2) DEFAULT 0,
  currency        CHAR(3) DEFAULT 'EUR',
  notes           TEXT,
  terms           TEXT,
  valid_until     DATE,
  template_id     VARCHAR(50),
  pdf_url         TEXT,
  sent_at         TIMESTAMPTZ,
  accepted_at     TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS (Ordini produzione)
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    VARCHAR(50) UNIQUE NOT NULL,
  client_id       UUID REFERENCES clients(id),
  client_name     VARCHAR(255),
  quote_id        UUID REFERENCES quotes(id),
  status          VARCHAR(30) DEFAULT 'backlog'
                  CHECK (status IN ('backlog','attesa','working','done','delivered','completato','annullato')),
  priority        VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  items           JSONB DEFAULT '[]',
  total_amount    DECIMAL(12,2) DEFAULT 0,
  currency        CHAR(3) DEFAULT 'EUR',
  notes           TEXT,
  internal_notes  TEXT,
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  production_time_minutes INTEGER DEFAULT 0,
  tags            TEXT[],
  attachments     JSONB DEFAULT '[]',
  metadata        JSONB DEFAULT '{}',
  assigned_to     UUID REFERENCES users(id),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER STATUS HISTORY
CREATE TABLE order_status_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status     VARCHAR(30),
  to_status       VARCHAR(30) NOT NULL,
  changed_by      UUID REFERENCES users(id),
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- SALES / INVOICES
CREATE TABLE sales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,
  client_id       UUID REFERENCES clients(id),
  client_name     VARCHAR(255),
  order_id        UUID REFERENCES orders(id),
  quote_id        UUID REFERENCES quotes(id),
  status          VARCHAR(20) DEFAULT 'da_pagare'
                  CHECK (status IN ('bozza','da_pagare','pagato','annullato','rimborso')),
  payment_method  VARCHAR(50),
  items           JSONB DEFAULT '[]',
  subtotal        DECIMAL(12,2) DEFAULT 0,
  tax_rate        DECIMAL(5,2) DEFAULT 22,
  tax_amount      DECIMAL(12,2) DEFAULT 0,
  discount        DECIMAL(10,2) DEFAULT 0,
  total_amount    DECIMAL(12,2) DEFAULT 0,
  amount_paid     DECIMAL(12,2) DEFAULT 0,
  currency        CHAR(3) DEFAULT 'EUR',
  notes           TEXT,
  payment_notes   TEXT,
  issue_date      DATE DEFAULT CURRENT_DATE,
  due_date        DATE,
  paid_at         TIMESTAMPTZ,
  pdf_url         TEXT,
  xml_sdi_url     TEXT,
  sdi_status      VARCHAR(30),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CASHFLOW
CREATE TABLE cashflow_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            VARCHAR(10) NOT NULL CHECK (type IN ('entrata','uscita')),
  category        VARCHAR(100),
  subcategory     VARCHAR(100),
  description     VARCHAR(255) NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  currency        CHAR(3) DEFAULT 'EUR',
  date            DATE NOT NULL,
  payment_method  VARCHAR(50),
  reference       VARCHAR(100),
  sale_id         UUID REFERENCES sales(id),
  supplier_id     UUID REFERENCES suppliers(id),
  is_recurring    BOOLEAN DEFAULT false,
  recurring_rule  JSONB DEFAULT '{}',
  attachment_url  TEXT,
  notes           TEXT,
  tags            TEXT[],
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  client_id       UUID REFERENCES clients(id),
  status          VARCHAR(30) DEFAULT 'active'
                  CHECK (status IN ('draft','active','on_hold','completed','archived')),
  type            VARCHAR(50),
  tags            TEXT[],
  files           JSONB DEFAULT '[]',
  thumbnail_url   TEXT,
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT VERSIONS
CREATE TABLE project_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  name            VARCHAR(255),
  file_url        TEXT,
  thumbnail_url   TEXT,
  notes           TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- IMAGE LIBRARY
CREATE TABLE image_library (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        VARCHAR(255) NOT NULL,
  original_name   VARCHAR(255),
  file_url        TEXT NOT NULL,
  thumbnail_url   TEXT,
  file_size       INTEGER,
  mime_type       VARCHAR(100),
  width           INTEGER,
  height          INTEGER,
  tags            TEXT[],
  category        VARCHAR(100),
  description     TEXT,
  is_public       BOOLEAN DEFAULT false,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- SOCIAL POSTS
CREATE TABLE social_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(255),
  content         TEXT NOT NULL,
  platform        VARCHAR(50),
  status          VARCHAR(20) DEFAULT 'draft'
                  CHECK (status IN ('draft','scheduled','published','failed')),
  image_url       TEXT,
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  hashtags        TEXT[],
  metrics         JSONB DEFAULT '{}',
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- EQUIPMENT
CREATE TABLE equipment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  type            VARCHAR(50),
  brand           VARCHAR(100),
  model           VARCHAR(100),
  serial_number   VARCHAR(100),
  purchase_date   DATE,
  purchase_price  DECIMAL(12,2),
  current_value   DECIMAL(12,2),
  status          VARCHAR(30) DEFAULT 'active',
  maintenance_due DATE,
  notes           TEXT,
  images          JSONB DEFAULT '[]',
  specs           JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- FIXED COSTS
CREATE TABLE fixed_costs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100),
  amount          DECIMAL(12,2) NOT NULL,
  currency        CHAR(3) DEFAULT 'EUR',
  frequency       VARCHAR(20) DEFAULT 'monthly',
  next_due_date   DATE,
  supplier_id     UUID REFERENCES suppliers(id),
  notes           TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  body            TEXT,
  data            JSONB DEFAULT '{}',
  is_read         BOOLEAN DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AI USAGE TRACKING
CREATE TABLE ai_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  model           VARCHAR(100),
  tokens_used     INTEGER NOT NULL,
  prompt_tokens   INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  cost_eur        DECIMAL(8,6),
  feature         VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- STORAGE USAGE
CREATE TABLE storage_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     VARCHAR(50),
  entity_id       UUID,
  file_url        TEXT NOT NULL,
  file_name       VARCHAR(255),
  file_size       BIGINT NOT NULL,
  mime_type       VARCHAR(100),
  created_by      UUID REFERENCES users(id),
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- SETTINGS (configurazioni tenant)
CREATE TABLE settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             VARCHAR(100) UNIQUE NOT NULL,
  value           JSONB,
  updated_by      UUID REFERENCES users(id),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES CRITICI
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_due_date ON orders(due_date);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_cashflow_date ON cashflow_entries(date);
CREATE INDEX idx_cashflow_type ON cashflow_entries(type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
```

---

## 5. SCHEMA API REST

### 5.1 Convenzioni

```
Base URL: https://api.ingly.app/v1
Auth:     Bearer JWT (header Authorization)
Tenant:   Ricavato da JWT claims (tenant_id)
Formato:  JSON (Content-Type: application/json)
Paginazione: ?page=1&limit=50
Filtri:   ?status=active&from=2026-01-01&to=2026-12-31
Sorting:  ?sort=created_at&order=desc
```

### 5.2 Endpoints per Servizio

#### AUTH API (`/auth`)
```
POST   /auth/login              — Login con username/password
POST   /auth/refresh            — Rinnova access token con refresh token
POST   /auth/logout             — Revoca sessione corrente
POST   /auth/logout-all         — Revoca tutte le sessioni
POST   /auth/mfa/enable         — Abilita MFA (genera QR code)
POST   /auth/mfa/verify         — Verifica codice TOTP
POST   /auth/mfa/disable        — Disabilita MFA
POST   /auth/password/change    — Cambia password
POST   /auth/password/reset     — Reset password (richiede token via email)
GET    /auth/me                 — Profilo utente corrente
GET    /auth/sessions           — Lista sessioni attive
DELETE /auth/sessions/:id       — Revoca sessione specifica
```

#### USERS API (`/users`)
```
GET    /users                   — Lista utenti (admin/manager)
POST   /users                   — Crea utente
GET    /users/:id               — Dettaglio utente
PUT    /users/:id               — Aggiorna utente
DELETE /users/:id               — Elimina utente
POST   /users/:id/suspend       — Sospendi utente
POST   /users/:id/activate      — Attiva utente
GET    /users/:id/activity      — Attività utente
```

#### CLIENTS API (`/clients`)
```
GET    /clients                 — Lista clienti (paginata, filtrata)
POST   /clients                 — Crea cliente
GET    /clients/:id             — Dettaglio cliente
PUT    /clients/:id             — Aggiorna cliente
DELETE /clients/:id             — Elimina cliente (soft delete)
GET    /clients/:id/orders      — Ordini del cliente
GET    /clients/:id/sales       — Vendite del cliente
GET    /clients/:id/stats       — Statistiche CLV, RFM
POST   /clients/import          — Importa da CSV/vCard
GET    /clients/export          — Esporta CSV/Excel
```

#### ORDERS API (`/orders`)
```
GET    /orders                  — Lista ordini (filtro status, date, cliente)
POST   /orders                  — Crea ordine
GET    /orders/:id              — Dettaglio ordine
PUT    /orders/:id              — Aggiorna ordine
DELETE /orders/:id              — Elimina ordine
PATCH  /orders/:id/status       — Cambia stato
GET    /orders/:id/history      — Storico stati
GET    /orders/kanban           — Vista kanban (raggruppata per status)
GET    /orders/overdue          — Ordini in ritardo
GET    /orders/stats            — Statistiche ordini
```

#### SALES API (`/sales`)
```
GET    /sales                   — Lista vendite/fatture
POST   /sales                   — Crea vendita/fattura
GET    /sales/:id               — Dettaglio
PUT    /sales/:id               — Aggiorna
DELETE /sales/:id               — Elimina
PATCH  /sales/:id/status        — Cambia stato pagamento
GET    /sales/:id/pdf           — Genera/scarica PDF
GET    /sales/:id/xml           — Genera XML SDI
POST   /sales/:id/send          — Invia via email
GET    /sales/stats             — Statistiche (revenue, MRR, etc.)
GET    /sales/recurring         — Lista fatture ricorrenti
POST   /sales/recurring         — Crea fattura ricorrente
```

#### QUOTES API (`/quotes`)
```
GET    /quotes                  — Lista preventivi
POST   /quotes                  — Crea preventivo
GET    /quotes/:id              — Dettaglio
PUT    /quotes/:id              — Aggiorna
DELETE /quotes/:id              — Elimina
PATCH  /quotes/:id/status       — Cambia stato
GET    /quotes/:id/pdf          — PDF preventivo
POST   /quotes/:id/send         — Invia via email
POST   /quotes/:id/convert      — Converti in ordine/fattura
```

#### PRODUCTS API (`/products`)
```
GET    /products                — Lista prodotti catalogo
POST   /products                — Crea prodotto
GET    /products/:id            — Dettaglio
PUT    /products/:id            — Aggiorna
DELETE /products/:id            — Elimina
GET    /products/categories     — Categorie
POST   /products/import         — Importa CSV
GET    /products/export         — Esporta CSV/Excel
```

#### INVENTORY API (`/inventory`)
```
GET    /inventory               — Lista inventario
POST   /inventory               — Aggiungi articolo
GET    /inventory/:id           — Dettaglio
PUT    /inventory/:id           — Aggiorna
DELETE /inventory/:id           — Elimina
PATCH  /inventory/:id/quantity  — Aggiorna quantità
GET    /inventory/alerts        — Articoli sotto scorta minima
GET    /inventory/valuation     — Valorizzazione magazzino
POST   /inventory/movement      — Registra movimento
```

#### CASHFLOW API (`/cashflow`)
```
GET    /cashflow                — Lista entrate/uscite (filtro tipo, date)
POST   /cashflow                — Registra movimento
GET    /cashflow/:id            — Dettaglio
PUT    /cashflow/:id            — Aggiorna
DELETE /cashflow/:id            — Elimina
GET    /cashflow/summary        — Riepilogo mensile
GET    /cashflow/forecast       — Previsioni cash
GET    /cashflow/chart          — Dati per grafici
```

#### ANALYTICS API (`/analytics`)
```
GET    /analytics/dashboard     — KPI principali
GET    /analytics/revenue       — Analisi ricavi (serie storica)
GET    /analytics/clients       — Analisi clienti (RFM, CLV)
GET    /analytics/products      — Prodotti più venduti
GET    /analytics/orders        — Performance ordini
GET    /analytics/cashflow      — Analisi cashflow
GET    /analytics/forecast      — ML forecast (30/60/90gg)
GET    /analytics/anomalies     — Rilevamento anomalie
```

#### AI API (`/ai`)
```
POST   /ai/chat                 — Chat con AI coach (context-aware)
POST   /ai/quote                — Genera preventivo AI
POST   /ai/description          — Genera descrizione prodotto
POST   /ai/reply                — Reply AI per email/messaggi
POST   /ai/social               — Genera post social
POST   /ai/etsy-seo             — Ottimizza listing Etsy
POST   /ai/analysis             — Analisi business generica
GET    /ai/usage                — Token usati questo mese
```

#### ADMIN API (`/admin`) — Solo superadmin
```
GET    /admin/tenants           — Lista tenant
POST   /admin/tenants           — Crea tenant
GET    /admin/tenants/:id       — Dettaglio tenant
PUT    /admin/tenants/:id       — Aggiorna tenant
POST   /admin/tenants/:id/suspend      — Sospendi
POST   /admin/tenants/:id/activate     — Attiva
GET    /admin/tenants/:id/stats        — Statistiche uso
GET    /admin/tenants/:id/users        — Utenti del tenant
GET    /admin/users             — Tutti gli utenti (cross-tenant)
POST   /admin/users/:id/force-logout   — Force logout
POST   /admin/users/:id/reset-password — Reset password
GET    /admin/licenses          — Lista licenze
PUT    /admin/licenses/:id      — Modifica licenza
POST   /admin/licenses/:id/revoke      — Revoca licenza
GET    /admin/devices           — Lista device registrati
POST   /admin/devices/:id/block        — Blocca device
GET    /admin/payments          — Lista pagamenti
GET    /admin/subscriptions     — Lista abbonamenti
GET    /admin/audit-logs        — Audit log globale
GET    /admin/stats             — Dashboard admin (MRR, utenti, etc.)
GET    /admin/support           — Ticket supporto
```

#### BILLING API (`/billing`)
```
GET    /billing/subscription    — Abbonamento corrente
POST   /billing/subscribe       — Abbonati a un piano
PUT    /billing/subscription    — Cambia piano
DELETE /billing/subscription    — Cancella abbonamento
GET    /billing/invoices        — Lista fatture SaaS
GET    /billing/invoices/:id/pdf — Scarica PDF fattura
POST   /billing/portal          — Genera link Stripe Customer Portal
GET    /billing/usage           — Utilizzo corrente (storage, token AI)
```

#### STORAGE API (`/storage`)
```
POST   /storage/upload          — Upload file
GET    /storage/files           — Lista file
DELETE /storage/files/:id       — Elimina file
GET    /storage/usage           — Utilizzo storage
POST   /storage/images          — Upload immagine con resize
```

#### NOTIFICATIONS API (`/notifications`)
```
GET    /notifications           — Lista notifiche
PATCH  /notifications/:id/read  — Segna come letta
PATCH  /notifications/read-all  — Segna tutte come lette
DELETE /notifications/:id       — Elimina
GET    /notifications/unread-count — Contatore notifiche non lette
```

---

## 6. ARCHITETTURA FRONTEND

### 6.1 Stack

```
Next.js 15 (App Router)
React 19
TypeScript 5.5+
Tailwind CSS 4
Shadcn UI (componenti base)
Zustand (state management)
React Query v5 (server state / cache)
React Hook Form + Zod (form validation)
Recharts / Chart.js (grafici)
date-fns (date utility)
Lucide React (icone)
```

### 6.2 Struttura Directory Frontend

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── mfa/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                    — Shell: sidebar + topbar
│   │   ├── page.tsx                      — Dashboard principale
│   │   ├── kpi/page.tsx
│   │   ├── ai/
│   │   │   ├── page.tsx                  — AI Hub
│   │   │   ├── coach/page.tsx
│   │   │   └── briefing/page.tsx
│   │   ├── sales/
│   │   │   ├── page.tsx                  — Lista vendite
│   │   │   ├── [id]/page.tsx             — Dettaglio fattura
│   │   │   ├── new/page.tsx
│   │   │   └── recurring/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx                  — Kanban ordini
│   │   │   ├── [id]/page.tsx
│   │   │   └── tracker/page.tsx
│   │   ├── quotes/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── materials/page.tsx
│   │   ├── cashflow/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── marketing/
│   │   │   ├── page.tsx
│   │   │   ├── social/page.tsx
│   │   │   ├── etsy/page.tsx
│   │   │   └── content/page.tsx
│   │   ├── analytics/
│   │   │   ├── page.tsx
│   │   │   └── forecasting/page.tsx
│   │   ├── finance/
│   │   │   ├── page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── equipment/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── brand/page.tsx
│   │   │   ├── team/page.tsx
│   │   │   └── billing/page.tsx
│   │   └── [...]                         — tutti i 113 moduli
│   ├── admin/                            — Super Admin Panel
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── tenants/
│   │   ├── users/
│   │   ├── billing/
│   │   ├── licenses/
│   │   ├── security/
│   │   └── audit/
│   └── api/                              — Next.js API routes (BFF)
│       └── [...route]/route.ts
├── components/
│   ├── ui/                               — Shadcn base components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── CommandPalette.tsx            — Ctrl+K
│   │   └── FavoritesBar.tsx
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── OrdersKanban.tsx
│   │   └── AIBriefing.tsx
│   ├── sales/
│   ├── orders/
│   ├── clients/
│   ├── products/
│   ├── inventory/
│   ├── cashflow/
│   ├── ai/
│   ├── shared/
│   │   ├── DataTable.tsx
│   │   ├── SearchInput.tsx
│   │   ├── ExportButton.tsx
│   │   ├── PDFPreview.tsx
│   │   └── ConfirmDialog.tsx
│   └── admin/
├── lib/
│   ├── api/                              — API client (fetch wrapper)
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── endpoints/
│   ├── store/                            — Zustand stores
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── tenant.store.ts
│   ├── hooks/                            — Custom React hooks
│   ├── utils/
│   │   ├── format.ts                     — fmtEur, fmtDate, etc.
│   │   ├── pdf.ts                        — PDF generation
│   │   └── excel.ts                      — Excel export
│   └── types/                            — TypeScript types
├── public/
└── styles/
    └── globals.css
```

### 6.3 Gestione Stato

```typescript
// auth.store.ts
interface AuthStore {
  user: User | null
  tenant: Tenant | null
  accessToken: string | null
  permissions: string[]
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

// ui.store.ts
interface UIStore {
  sidebarCollapsed: boolean
  activeSection: string
  favorites: string[]
  theme: 'light' | 'dark' | 'system'
  commandPaletteOpen: boolean
}
```

### 6.4 Autenticazione Frontend

```typescript
// Middleware Next.js per protezione route
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')
  if (!token && !isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  // Verifica JWT, tenant, ruolo
}
```

### 6.5 Module Guard (Piano Abbonamento)

```typescript
// Hook per controllo accesso modulo
function useModuleAccess(moduleId: string): boolean {
  const { tenant } = useAuthStore()
  return tenant?.subscription?.plan?.modules_list?.includes(moduleId) ?? false
}

// Componente wrapper
function ModuleGuard({ moduleId, children }) {
  const hasAccess = useModuleAccess(moduleId)
  if (!hasAccess) return <UpgradePrompt module={moduleId} />
  return children
}
```

---

## 7. ARCHITETTURA BACKEND

### 7.1 Stack

```
Node.js 22 LTS
Fastify 5 (HTTP framework — 3x più veloce di Express)
TypeScript 5.5
Prisma ORM (con PostgreSQL)
BullMQ (job queue con Redis)
ioredis (Redis client)
JWT (jose library)
bcrypt (password hashing)
zod (validazione input)
pino (logging strutturato)
OpenTelemetry (tracing)
```

### 7.2 Struttura Monorepo

```
apps/
├── web/                          — Next.js frontend
├── api-identity/                 — Auth + Users
├── api-commerce/                 — Sales + Quotes + Cashflow
├── api-production/               — Orders + Projects + Workflow
├── api-crm/                      — Clients + Pipeline + Analytics
├── api-catalog/                  — Products + Templates + Inventory
├── api-intelligence/             — AI + Analytics + Forecasting
├── api-marketing/                — Social + Etsy + Content
├── api-admin/                    — Super Admin + Licensing
├── api-billing/                  — Billing + Subscriptions + Stripe
├── api-storage/                  — File upload + Image library
└── api-notifications/            — Push + Email + In-app

packages/
├── db/                           — Prisma schema + migrations
├── auth/                         — JWT middleware condiviso
├── queue/                        — BullMQ workers condivisi
├── cache/                        — Redis helpers
├── logger/                       — Pino logger configurato
├── errors/                       — Custom error classes
├── types/                        — TypeScript types condivisi
└── utils/                        — Utility functions

infrastructure/
├── docker/
├── k8s/
└── terraform/
```

### 7.3 Pattern API Service

```typescript
// Struttura standard di ogni microservizio
// apps/api-commerce/src/
├── index.ts                      — Entry point Fastify
├── routes/
│   ├── sales.routes.ts
│   ├── quotes.routes.ts
│   └── cashflow.routes.ts
├── handlers/
│   ├── sales.handler.ts
│   ├── quotes.handler.ts
│   └── cashflow.handler.ts
├── services/
│   ├── sales.service.ts          — Business logic
│   ├── quotes.service.ts
│   └── cashflow.service.ts
├── repositories/
│   ├── sales.repository.ts       — Prisma queries
│   ├── quotes.repository.ts
│   └── cashflow.repository.ts
├── schemas/
│   ├── sales.schema.ts           — Zod validation
│   └── quotes.schema.ts
└── jobs/
    ├── recurring-invoices.job.ts
    └── pdf-generation.job.ts
```

### 7.4 Middleware Pipeline

```
Request →
  1. Rate Limiter (per IP + per tenant)
  2. CORS check
  3. JWT Verify (access token)
  4. Tenant Extraction (da JWT claims)
  5. Schema selection (PostgreSQL schema per tenant)
  6. RBAC check (ruolo + permesso richiesto)
  7. Plan check (modulo abilitato nel piano)
  8. Input Validation (Zod)
  9. Handler
  10. Audit Log (async, non blocca)
→ Response
```

### 7.5 Job Queue (BullMQ)

```
Queues:
  pdf-generation         — Generazione PDF fatture/preventivi (async)
  email-send             — Invio email transazionali
  ai-processing          — Richieste AI (rate-limited per tenant)
  recurring-invoices     — Cron: genera fatture ricorrenti mensili
  backup                 — Backup automatico dati tenant
  report-generation      — Report PDF mensili
  notification-dispatch  — Invio notifiche push/in-app
  stock-alerts           — Controllo scorte minime
  subscription-check     — Verifica abbonamenti scaduti
```

### 7.6 Caching Strategy

```
Redis Keys:
  session:{token}                — JWT session data (TTL: 24h)
  tenant:{id}:plan               — Piano attivo (TTL: 5min)
  tenant:{id}:modules            — Moduli abilitati (TTL: 5min)
  tenant:{id}:kpi:{date}         — KPI giornalieri (TTL: 1h)
  user:{id}:permissions          — Permessi utente (TTL: 10min)
  ai-usage:{tenant}:{month}      — Token AI usati (TTL: 1 giorno)
```

---

## 8. ADMIN PANEL ENTERPRISE

### 8.1 Funzionalità Super Admin

```
DASHBOARD
├── MRR (Monthly Recurring Revenue) live
├── Nuovi tenant (trial/paid) ultimi 30gg
├── Churn rate
├── Total tenants: attivi / trial / sospesi / bannati
├── Utenti totali online ora
├── Storage usato totale
├── Token AI consumati questo mese
├── Security alerts aperti
└── Top tenants per revenue

GESTIONE TENANT
├── Lista con filtri (status, piano, data)
├── Dettaglio tenant: info, abbonamento, utilizzo
├── Crea tenant manuale
├── Sospendi / Banna / Attiva
├── Override piano (promo, trial esteso)
├── Impersona tenant (accesso con permesso)
└── Esporta CSV

GESTIONE UTENTI (cross-tenant)
├── Lista utenti con tenant
├── Dettaglio: sessioni attive, device, attività
├── Force logout singolo / tutti
├── Reset password
├── Sospendi account
├── Storico accessi e azioni
└── Security score

GESTIONE LICENZE
├── Lista licenze attive/scadute/revocate
├── Dettaglio: dispositivi registrati
├── Crea licenza manuale
├── Revoca licenza
├── Blocca device specifico
├── Estendi validità
└── Device management globale

GESTIONE ABBONAMENTI
├── Lista abbonamenti con status Stripe
├── Gestione pagamenti falliti (retry)
├── Cambio piano manuale
├── Applica coupon/sconto
├── Pausa abbonamento
├── Gestione rimborsi
└── Revenue analytics

GESTIONE SUPPORTO
├── Ticket aperti / in lavorazione / risolti
├── Assegna ticket ad admin
├── Template risposte rapide
├── SLA monitor
└── Customer satisfaction

SECURITY CENTER
├── Tentativi login falliti
├── IP sospetti / blacklist
├── Anomalie utilizzo (burst AI, upload massicci)
├── Active alerts
├── Geo-map accessi
└── Blocca IP

AUDIT LOG GLOBALE
├── Tutte le azioni admin
├── Filtri: admin, tenant, tipo azione, data
├── Export CSV/Excel
└── Retention: 2 anni

SETTINGS PIATTAFORMA
├── Gestione piani (prezzi, feature, limiti)
├── Configurazione email transazionali
├── AI keys e configurazione modelli
├── Rate limiting globale
├── Manutenzione programmata
└── Feature flags globali
```

### 8.2 Real-time Sync (WebSocket)

Sostituisce l'attuale BroadcastChannel con WebSocket server-side:

```
Admin action → API → PostgreSQL → Redis pub/sub → WebSocket gateway → Tenant browser

Azioni sync:
  SUSPEND_USER       → utente vede: "Account sospeso"
  BAN_USER           → utente vede: "Account bannato"  
  FORCE_LOGOUT       → JWT revocato, redirect login
  PLAN_CHANGE        → moduli si sbloccano/bloccano
  LICENSE_REVOKE     → accesso negato
  PASSWORD_RESET     → force logout
```

---

## 9. SISTEMA BILLING & ABBONAMENTI

### 9.1 Integrazione Stripe

```
Provider: Stripe (pagamenti EU/ITA compliant, SCA, SEPA)
Prodotti Stripe:
  prod_starter    → price_starter_monthly + price_starter_yearly
  prod_pro        → price_pro_monthly + price_pro_yearly
  prod_business   → price_business_monthly + price_business_yearly
  prod_enterprise → price_enterprise_monthly + price_enterprise_yearly

Webhooks gestiti:
  customer.subscription.created     → Attiva tenant + licenza
  customer.subscription.updated     → Aggiorna piano
  customer.subscription.deleted     → Disattiva accesso (grace period 3gg)
  invoice.payment_succeeded         → Registra pagamento + invia fattura
  invoice.payment_failed            → Notifica + retry
  customer.subscription.trial_will_end → Email reminder 3gg prima
```

### 9.2 Piano Feature Matrix

```
FEATURE                      STARTER  PRO    BUSINESS  ENTERPRISE
─────────────────────────────────────────────────────────────────
Moduli disponibili            30       60     85        113
Utenti massimi                1        3      10        Illimitati
Storage                       2GB      10GB   50GB      200GB
AI tokens/mese                10.000   100K   500K      Illimitati
PDF export                    ✓        ✓      ✓         ✓
Excel export                  -        ✓      ✓         ✓
XML SDI fatturazione          -        ✓      ✓         ✓
API access                    -        -      ✓         ✓
White label                   -        -      -         ✓
Custom domain                 -        -      -         ✓
SSO/SAML                      -        -      -         ✓
Priority support              -        -      ✓         ✓
Dedicated CSM                 -        -      -         ✓
SLA uptime                    99%      99.5%  99.9%     99.99%
Backup retention              7gg      30gg   90gg      1 anno
```

### 9.3 Trial Flow

```
1. Utente si registra → Trial 14 giorni (piano Business)
2. Accesso completo durante trial
3. Giorno 11: email reminder con CTA upgrade
4. Giorno 13: email urgente
5. Fine trial: downgrade automatico a Starter (read-only per 7gg)
6. Giorno 21: dati ancora disponibili, funzioni bloccate
7. Giorno 30: account sospeso, dati trattenuti 90gg
8. Upgrade in qualsiasi momento riattiva tutto
```

---

## 10. SISTEMA LICENZE & DEVICE MANAGEMENT

### 10.1 License Flow

```
1. Pagamento completato → Webhook Stripe
2. Crea record subscription
3. Genera license_key (UUID v4 firmato con HMAC)
4. Invia licenza via email
5. Utente accede dal browser
6. Device fingerprint generato (canvas + WebGL + timezone + screen + CPU)
7. Se device già registrato: OK
8. Se device nuovo: verifica max_devices
   - Se < max: registra device, concedi accesso
   - Se >= max: mostra device manager (scelta quale revocare)
9. Ogni 60s: heartbeat per tracciare device attivi
```

### 10.2 Remote Controls (Admin → Tenant)

```
Action                  Effetto                         Latency
──────────────────────────────────────────────────────────────
FORCE_LOGOUT            JWT revocato in Redis            <1s
FORCE_LOGOUT_ALL        Tutte sessioni revocate          <1s
SUSPEND_ACCOUNT         Flag in DB, check ogni auth      <3s
BAN_ACCOUNT             Blocco permanente                <1s
DEVICE_BLOCK            Device fingerprint in blacklist  <1s
LICENSE_REVOKE          License_key invalidata           <1s
PLAN_DOWNGRADE          Moduli bloccati immediatamente   <3s
PASSWORD_FORCE_RESET    Sessioni revocate + email        <1s
```

---

## 11. MULTI-TENANCY

### 11.1 Isolamento Dati

```sql
-- Al provisioning nuovo tenant
CREATE SCHEMA tenant_550e8400_e29b_41d4_a716_446655440000;
SET search_path TO tenant_550e8400_e29b_41d4_a716_446655440000;
-- Esegue migration SQL per creare tutte le tabelle
-- Inserisce settings di default
```

### 11.2 Tenant Middleware

```typescript
// Ogni request porta tenant context
fastify.addHook('preHandler', async (request) => {
  const { tenant_id, user_id } = request.jwtPayload
  // Imposta search_path PostgreSQL per la connessione
  await db.$executeRaw`SET search_path TO ${'tenant_' + tenant_id.replace(/-/g,'_')}, public`
  request.tenantId = tenant_id
  request.userId = user_id
})
```

### 11.3 Storage Isolation

```
S3 bucket structure:
  ingly-saas/
  ├── tenants/
  │   ├── {tenant_id}/
  │   │   ├── images/
  │   │   ├── documents/
  │   │   ├── backups/
  │   │   └── exports/
  └── platform/
      ├── plan-assets/
      └── email-templates/

Ogni URL S3 è signed (TTL 1h) — mai URL pubblici permanenti
```

---

## 12. SICUREZZA ENTERPRISE

### 12.1 Authentication

```
Access Token:  JWT HS256, TTL 15 minuti
Refresh Token: opaque token (UUID), TTL 30 giorni
               salvato in HttpOnly Secure cookie
               + record in DB per revoca server-side

Rotation: refresh token ruotato ad ogni uso (Refresh Token Rotation)
Revoca: Redis Set con token revocati (bloom filter per performance)
```

### 12.2 RBAC (Role-Based Access Control)

```
Ruoli (per tenant):
  owner    — Accesso totale al tenant
  admin    — Gestione utenti + tutte le funzioni
  manager  — Accesso a tutti i moduli, no billing/settings
  user     — Accesso ai moduli assegnati
  viewer   — Solo lettura

Permessi (granulari):
  {resource}:{action}
  Esempi:
    sales:read, sales:write, sales:delete
    orders:read, orders:write, orders:delete
    clients:read, clients:write
    analytics:read
    admin:users:manage
    billing:manage
```

### 12.3 Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 12.4 Rate Limiting

```
Login:              5 tentativi / 15min per IP → lockout 30min
API generale:       1000 req/min per tenant
AI endpoints:       basato su piano (token budget)
Upload:             100MB/h per tenant
Export:             10 export/h per utente
Password reset:     3 req/h per email
```

### 12.5 OWASP Top 10 Mitigations

| Vulnerabilità | Mitigazione |
|---|---|
| SQL Injection | Prisma ORM (prepared statements only) |
| XSS | React DOM escaping + CSP nonce |
| CSRF | SameSite=Strict cookie + CORS strict |
| Broken Auth | JWT rotation + Redis revocation |
| Sensitive Data | Encryption at rest (AES-256) + TLS 1.3 |
| Security Misconfiguration | IaC Terraform + hardened defaults |
| Insecure Deserialization | Zod schema validation su ogni input |
| Broken Access Control | RBAC middleware + tenant isolation |
| Logging failures | Structured logging con Pino + audit trail |
| SSRF | URL allowlist per AI proxying |

---

## 13. TESTING STRATEGY

### 13.1 Piramide Test

```
         /\
        /  \  E2E Tests (Playwright)
       /    \  5% — happy path + critical flows
      /──────\
     /        \ Integration Tests (Supertest + testcontainers)
    /          \  20% — API endpoints, DB queries
   /────────────\
  /              \ Unit Tests (Vitest)
 /                \  75% — services, utils, validators
/──────────────────\
```

### 13.2 Test Cases per Dominio

**Auth:**
- Login valido / credenziali errate / account sospeso
- MFA: enable, verify code, disable
- Token refresh / revoca / scadenza
- Force logout remoto
- Rate limiting login

**Billing:**
- Subscribe a piano / cambio piano / cancella
- Webhook Stripe: payment_succeeded / payment_failed
- Downgrade automatico alla scadenza
- Feature blocking per piano

**Orders:**
- Crea / aggiorna / cambia stato
- Kanban: spostamento colonne
- Alerting ritardi
- Export PDF/Excel

**Multi-tenancy:**
- Isolamento: utente tenant A non può vedere dati tenant B
- Schema selection corretto
- Device management: max devices enforcement

### 13.3 CI Test Pipeline

```yaml
on: [push, pull_request]
jobs:
  test:
    - lint (ESLint + Prettier)
    - typecheck (tsc --noEmit)
    - unit tests (vitest --coverage)
    - integration tests (docker-compose test db)
    - e2e tests (playwright headed)
    - security scan (npm audit + SAST)
    - coverage report (>80% required)
```

---

## 14. DEVOPS & INFRASTRUTTURA

### 14.1 Docker Compose (Development)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    
  redis:
    image: redis:7-alpine
    
  minio:
    image: minio/minio
    
  api-identity:
    build: ./apps/api-identity
    depends_on: [postgres, redis]
    
  api-commerce:
    build: ./apps/api-commerce
    
  web:
    build: ./apps/web
    depends_on: [api-identity, api-commerce]
```

### 14.2 GitHub Actions CI/CD

```
Branches:
  main       → Production (auto-deploy)
  staging    → Staging (auto-deploy)
  develop    → Test env
  feature/*  → PR preview

Pipeline:
  1. Lint + Type Check
  2. Unit Tests
  3. Integration Tests
  4. Build Docker images
  5. Push to Container Registry (ghcr.io)
  6. Deploy to staging
  7. Run E2E tests on staging
  8. Manual approval → Deploy production
  9. Smoke tests production
  10. Rollback automatico se smoke test fallisce
```

### 14.3 Infrastruttura Produzione

```
Opzione A — Fully Managed (consigliata per MVP):
  Frontend:   Vercel (Next.js native)
  Backend:    Railway / Render (Node.js services)
  Database:   Supabase (PostgreSQL managed + pgvector)
  Cache:      Upstash Redis (serverless)
  Storage:    Cloudflare R2 (S3-compatible, free egress)
  CDN:        Cloudflare (incluso con R2)
  Monitoring: Sentry (errors) + Vercel Analytics
  Email:      Resend (transactional)
  Payments:   Stripe

Costo stimato infrastruttura (500 tenant):
  Vercel Pro: $20/mese
  Railway Pro: $100/mese (5 servizi)
  Supabase Pro: $25/mese + $0.09/GB
  Upstash: $0-30/mese
  Cloudflare R2: $0.015/GB/mese
  Sentry: $26/mese
  Resend: $20/mese
  Stripe: 1.4% + €0.25 per transazione (EU)
  ─────────────────────────────────────
  TOTALE stimato: ~€250/mese per 500 tenant

Opzione B — Self-hosted (VPS):
  Hetzner Cloud: CX31 = €10.90/mese (2 vCPU, 8GB RAM)
  Gestione manuale Docker Compose + Nginx
  
Opzione C — Kubernetes (Enterprise):
  GKE / EKS / AKS per scala >1000 tenant
```

### 14.4 Monitoring & Observability

```
Error Tracking:    Sentry (frontend + backend)
Metrics:           Prometheus + Grafana
Logging:           Pino → Loki → Grafana
Tracing:           OpenTelemetry → Jaeger / Grafana Tempo
Uptime:            UptimeRobot / BetterUptime
APM:               Grafana k6 (load testing)

Alert Rules:
  - Error rate > 1% → PagerDuty
  - API p95 > 500ms → Slack alert
  - DB connections > 80% → Auto-scale
  - Tenant storage > 90% → Email tenant
  - Failed payments > 5/h → Slack alert
  - Security alert → Immediate PagerDuty
```

---

## 15. ROADMAP IMPLEMENTAZIONE

### FASE 0 — Setup & Foundation (Settimane 1-2)
```
[ ] Setup monorepo (Turborepo)
[ ] Setup PostgreSQL schema (migrazioni Prisma)
[ ] Setup Redis
[ ] Setup S3/MinIO
[ ] Setup CI/CD GitHub Actions
[ ] Configurazione ambienti (dev/staging/prod)
[ ] Setup Sentry, logging
```

### FASE 1 — Auth & Identity (Settimane 3-4)
```
[ ] api-identity: login, refresh, logout
[ ] JWT middleware condiviso
[ ] MFA TOTP
[ ] Device fingerprinting server-side
[ ] Frontend: login page, auth store
[ ] Admin: gestione utenti base
```

### FASE 2 — Core CRUD (Settimane 5-8)
```
[ ] api-crm: clients CRUD
[ ] api-commerce: sales, quotes, cashflow
[ ] api-production: orders (kanban)
[ ] api-catalog: products, inventory
[ ] Frontend: tutti i moduli core
[ ] Import dati da IndexedDB (migrazione utenti esistenti)
```

### FASE 3 — AI & Analytics (Settimane 9-10)
```
[ ] api-intelligence: proxy AI sicuro (chiavi server-side)
[ ] AI Coach con context-awareness
[ ] Analytics dashboard
[ ] Forecasting
[ ] Anomaly detection
```

### FASE 4 — Billing & Licensing (Settimane 11-12)
```
[ ] api-billing: Stripe integration
[ ] Webhook handlers
[ ] Plan enforcement middleware
[ ] License server
[ ] Device management
[ ] Trial flow
```

### FASE 5 — Admin Panel (Settimane 13-14)
```
[ ] Super admin dashboard
[ ] Tenant management
[ ] License management
[ ] Real-time sync WebSocket
[ ] Security center
[ ] Audit log viewer
```

### FASE 6 — Moduli Avanzati (Settimane 15-18)
```
[ ] Marketing + Social Hub
[ ] Etsy SEO Wizard
[ ] Forecasting avanzato
[ ] Report PDF avanzati
[ ] XML SDI fatturazione
[ ] Tutti i moduli rimanenti
```

### FASE 7 — Testing & Security (Settimane 19-20)
```
[ ] Coverage unit test > 80%
[ ] Integration tests
[ ] E2E Playwright
[ ] Penetration test
[ ] GDPR compliance review
[ ] Performance audit
```

### FASE 8 — Launch Prep (Settimane 21-22)
```
[ ] Migrazione dati utenti beta
[ ] Load testing
[ ] Documentazione API (OpenAPI/Swagger)
[ ] Onboarding wizard
[ ] Email transazionali
[ ] Landing page SaaS
[ ] Go-live
```

---

## 16. STRUTTURA REPOSITORY

```
ingly-os/                               ← Root monorepo
├── apps/
│   ├── web/                            ← Next.js 15 frontend
│   ├── api-identity/                   ← Fastify: Auth + Users
│   ├── api-commerce/                   ← Fastify: Sales + Quotes + Cashflow
│   ├── api-production/                 ← Fastify: Orders + Projects
│   ├── api-crm/                        ← Fastify: Clients + Pipeline
│   ├── api-catalog/                    ← Fastify: Products + Inventory
│   ├── api-intelligence/               ← Fastify: AI + Analytics
│   ├── api-marketing/                  ← Fastify: Social + Etsy
│   ├── api-admin/                      ← Fastify: Super Admin + Licenses
│   ├── api-billing/                    ← Fastify: Stripe + Subscriptions
│   ├── api-storage/                    ← Fastify: S3 + Image Library
│   └── api-notifications/              ← Fastify: Push + Email + In-app
│
├── packages/
│   ├── db/                             ← Prisma schema + migrations
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── auth/                           ← JWT + RBAC middleware
│   ├── queue/                          ← BullMQ workers
│   ├── cache/                          ← Redis helpers
│   ├── logger/                         ← Pino configurato
│   ├── errors/                         ← Custom error classes
│   ├── types/                          ← TypeScript shared types
│   └── utils/                          ← Utility (format, pdf, etc.)
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml          ← Development
│   │   ├── docker-compose.prod.yml     ← Production
│   │   └── Dockerfiles per ogni app
│   ├── nginx/
│   │   └── nginx.conf                  ← Reverse proxy config
│   ├── postgres/
│   │   └── init.sql                    ← Init DB scripts
│   └── terraform/                      ← IaC (opzionale)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      ← Test + Lint
│       ├── deploy-staging.yml
│       └── deploy-production.yml
│
├── docs/
│   ├── migration/                      ← Questo documento
│   ├── api/                            ← OpenAPI specs
│   ├── architecture/                   ← Diagrammi
│   └── runbooks/                       ← Procedure operative
│
├── package.json                        ← Turborepo root
├── turbo.json                          ← Pipeline Turborepo
├── tsconfig.base.json
└── .env.example
```

---

## 17. STIMA TEMPI & COSTI

### 17.1 Team Necessario

| Ruolo | Seniority | Ore/sett | Durata |
|---|---|---|---|
| Full-stack Lead | Senior | 40h | 22 settimane |
| Frontend Developer | Mid | 40h | 18 settimane |
| Backend Developer | Mid/Senior | 40h | 20 settimane |
| DevOps Engineer | Senior | 20h | 8 settimane |
| QA Engineer | Mid | 20h | 10 settimane |
| UI/UX Designer | Mid | 20h | 6 settimane |
| **PM / Tech Lead** | Senior | 10h | 22 settimane |

### 17.2 Stima Ore per Fase

| Fase | Descrizione | Ore stimate |
|---|---|---|
| 0 | Setup & Foundation | 80h |
| 1 | Auth & Identity | 160h |
| 2 | Core CRUD (6 servizi + frontend) | 480h |
| 3 | AI & Analytics | 200h |
| 4 | Billing & Licensing | 240h |
| 5 | Admin Panel | 200h |
| 6 | Moduli avanzati (55 moduli) | 400h |
| 7 | Testing & Security | 160h |
| 8 | Launch Prep | 80h |
| **Totale** | | **~2.000h** |

### 17.3 Stima Costi Sviluppo

| Scenario | Tariffa | Costo Totale | Durata |
|---|---|---|---|
| Team interno (3 devs) | €50/h avg | €100.000 | 6 mesi |
| Agenzia Europa | €80/h avg | €160.000 | 5 mesi |
| Agenzia nearshore | €35/h avg | €70.000 | 7 mesi |
| Freelance senior | €65/h avg | €130.000 | 6 mesi |
| **MVP minimo** (solo Fasi 0-4) | €50/h avg | **€48.000** | 3 mesi |

### 17.4 Break-even Analysis

```
Costo sviluppo MVP: €48.000
Costo infrastruttura: €250/mese

Revenue necessaria per break-even:
  Con piano medio €49 (Pro):
    98 clienti paganti → break-even infrastruttura
    980 clienti paganti → break-even sviluppo (a €49/mese) in 1 anno

MRR projections:
  100 clienti × €49 avg  = €4.900/mese  (€58.800/anno)
  500 clienti × €49 avg  = €24.500/mese (€294.000/anno)
  1000 clienti × €49 avg = €49.000/mese (€588.000/anno)
```

### 17.5 Approccio Consigliato: MVP Lean

Per minimizzare il rischio, consigliamo un approccio in 2 stadi:

**Stadio 1 — MVP (3 mesi, ~€48.000)**
- Auth + Users + Sessions
- Tutte le funzioni Core (ordini, clienti, vendite, catalogo, cashflow)
- Billing Stripe (4 piani)
- Admin Panel essenziale
- Deploy su Vercel + Supabase + Railway
- Obiettivo: 50 beta tester → 20 paganti

**Stadio 2 — Growth (3 mesi successivi, ~€52.000)**
- Tutti i 113 moduli
- AI avanzato
- Analytics ML
- Admin Panel completo con security center
- Performance optimization
- Marketing/Etsy moduli
- Obiettivo: 200 clienti paganti

---

## APPENDICE: Migrazione Dati Utenti Esistenti

Per gli utenti che usano attualmente la versione HTML, il processo di migrazione dati è:

```typescript
// Migration utility (eseguita one-time)
// 1. Utente apre la nuova app e clicca "Importa dati da versione precedente"
// 2. Seleziona il file di backup (export JSON da vecchia versione)
// 3. Il sistema parsa il JSON e fa bulk insert nelle tabelle PostgreSQL
// 4. Mapping automatico: vecchi store IDB → nuove tabelle

const STORE_TABLE_MAP = {
  'sales':       'sales',
  'clients':     'clients',
  'quotes':      'quotes',
  'cashflow':    'cashflow_entries',
  'orders':      'orders',
  'materials':   'materials',
  'equipment':   'equipment',
  'catalog':     'products',
  'inventory':   'inventory_items',
  'image_lib':   'image_library',
  'items':       'inventory_items',
  'ideas':       'projects',      // con type='idea'
  'suppliers':   'suppliers',
  'social_posts':'social_posts',
  'projects':    'projects',
}
```

---

*Documento generato il 23 Giugno 2026*  
*INGLY OS SaaS Migration Plan v1.0*  
*Per uso interno — Riservato*
