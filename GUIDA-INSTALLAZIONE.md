# 🚀 GUIDA INSTALLAZIONE — INGLY OS SaaS
## Per non esperti — Segui questi passaggi in ordine

---

## ✅ COSA TI SERVE (prima di iniziare)

Installa questi 3 programmi gratuiti. Clicca il link, scarica, installa con le impostazioni predefinite:

| Programma | Scaricalo da | Serve per |
|---|---|---|
| **Node.js 22** | https://nodejs.org → clicca "LTS" | Far girare il codice |
| **Docker Desktop** | https://www.docker.com/products/docker-desktop | Database e Redis |
| **Git** | https://git-scm.com/downloads | Scaricare il progetto |

> 💡 **Come verificare l'installazione:** Apri il Terminale (Mac: Cmd+Space → "Terminale") o Command Prompt (Windows: tasto Windows → "cmd") e digita:
> ```
> node --version    → deve mostrare v22.x.x
> docker --version  → deve mostrare Docker version 24.x
> ```

---

## 🖥️ COME APRIRE IL TERMINALE

**Mac:**
1. Premi `Cmd + Spazio`
2. Digita "Terminale"
3. Premi Invio

**Windows:**
1. Premi il tasto Windows
2. Digita "cmd" oppure "PowerShell"
3. Clicca "Esegui come amministratore"

---

## 📥 PASSO 1 — Scarica il progetto

Copia e incolla questo comando nel Terminale:

```bash
git clone https://github.com/inglyum/ingly-design-tool.git ingly-os
cd ingly-os
```

Dovresti vedere una cartella `ingly-os` crearsi.

---

## 🔧 PASSO 2 — Copia il file di configurazione

```bash
cp .env.example .env
```

> Questo crea il file `.env` con le impostazioni di default. **Non modificarlo** per ora — funziona già.

---

## 🐳 PASSO 3 — Avvia il Database (Docker)

**Prima assicurati che Docker Desktop sia aperto** (l'icona della balena nella barra di sistema).

Poi digita:

```bash
npm run docker:up
```

Vedrai scaricare i container. Aspetta circa 2-3 minuti la prima volta.

Per verificare che tutto funzioni:
```bash
docker ps
```
Dovresti vedere 3 righe: `ingly_postgres`, `ingly_redis`, `ingly_minio`.

---

## 📦 PASSO 4 — Installa le dipendenze

```bash
npm install
```

Questo scarica tutte le librerie. Può richiedere 2-5 minuti la prima volta.

---

## 🗄️ PASSO 5 — Prepara il Database

Naviga nella cartella database e crea le tabelle:

```bash
cd packages/db
npx prisma generate
npx prisma migrate dev --name init
npx tsx src/seed.ts
cd ../..
```

Al termine vedrai:
```
🎉 Seed completato!
═══════════════════════════════════════════
  🔑 CREDENZIALI DI ACCESSO
═══════════════════════════════════════════
  App:        http://localhost:3000
  Admin:      http://localhost:3000/admin
  ...
```

**Salva queste credenziali!**

---

## ▶️ PASSO 6 — Avvia l'applicazione

Apri **due finestre del Terminale** (o due tab).

**Terminale 1 — Backend API:**
```bash
cd apps/api
npm install
npm run dev
```
Vedrai: `🚀 INGLY OS API avviata su http://localhost:4000`

**Terminale 2 — Frontend Web:**
```bash
cd apps/web
npm install
npm run dev
```
Vedrai: `▶ Ready on http://localhost:3000`

---

## 🌐 PASSO 7 — Apri il browser

Apri **Google Chrome** (o Firefox) e vai su:

```
http://localhost:3000
```

Vedrai la pagina di login di INGLY OS!

---

## 🔑 CREDENZIALI DI ACCESSO

### Utente Demo (artigiano)
| Campo | Valore |
|---|---|
| Email | `mario@laserartstudio.it` |
| Password | `Demo2026!` |

### Super Admin
| Campo | Valore |
|---|---|
| Email | `superadmin@ingly.app` |
| Password | `Admin2026!` |
| Link Admin | `http://localhost:3000/admin` |

---

## 🧪 COSA TESTARE

### Come utente demo:

1. **Login** con mario@laserartstudio.it / Demo2026!
2. **Dashboard** → vedi KPI, revenue mese, ordini attivi
3. **Ordini** → kanban con 5 ordini demo, trascina tra le colonne
4. **Fatture** → 6 fatture demo, prova a segnarne una come pagata
5. **Clienti** → 5 clienti demo, crea un nuovo cliente
6. **Cashflow** → grafico entrate/uscite, registra un movimento
7. **Analytics** → grafici, previsioni AI prossimi 3 mesi

### Come Super Admin:

1. **Login** con superadmin@ingly.app / Admin2026!
2. **http://localhost:3000/admin**
3. **Dashboard Admin** → vedi MRR, tenant totali
4. **Tenant** → lista tenant, sospendi/attiva
5. **Licenze** → gestisci licenze
6. **Audit Log** → vedi azioni admin

---

## 📊 STRUMENTI EXTRA (opzionali)

| Strumento | URL | Credenziali |
|---|---|---|
| **Adminer** (gestione DB) | http://localhost:8080 | Server: `postgres`, User: `ingly`, Password: `inglypass`, DB: `inglydb` |
| **MinIO** (storage file) | http://localhost:9001 | User: `minioadmin`, Password: `minioadmin` |

---

## 🔄 COME RIAVVIARE

Se hai spento il PC e vuoi riaprire l'app:

```bash
# 1. Assicurati che Docker sia aperto
npm run docker:up

# 2. Terminale 1 - API
cd apps/api && npm run dev

# 3. Terminale 2 - Web
cd apps/web && npm run dev

# 4. Apri http://localhost:3000
```

---

## 🛑 COME FERMARE TUTTO

```bash
# Ferma i container Docker
npm run docker:down

# Per fermare API e Web: premi Ctrl+C in ogni terminale
```

---

## ❌ PROBLEMI FREQUENTI

### "Cannot find module" o errori npm
```bash
npm install  # nella cartella radice
cd apps/api && npm install
cd ../web && npm install
```

### "Port 3000 already in use"
```bash
# Mac/Linux:
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:4000)

# Windows:
netstat -ano | findstr :3000
taskkill /PID [numero_pid] /F
```

### "Docker: Cannot connect"
→ Apri **Docker Desktop** prima di tutto!

### Database non raggiungibile
```bash
docker ps  # controlla che postgres sia in running
npm run docker:up  # se non è attivo
```

### Login fallisce
→ Assicurati di aver fatto il seed (Passo 5)
→ Aspetta 5 secondi dopo `npm run docker:up`

---

## 🏗️ STRUTTURA FILE (per curiosi)

```
ingly-os/
├── apps/
│   ├── web/          ← Interfaccia utente (Next.js)
│   └── api/          ← Backend API (Fastify)
├── packages/
│   └── db/           ← Database (Prisma + PostgreSQL)
├── infrastructure/
│   └── docker/       ← Docker compose
├── .env              ← Configurazioni (NON condividere)
└── GUIDA-INSTALLAZIONE.md  ← Questo file
```

---

## 📞 SUPPORTO

Se qualcosa non funziona:
1. Controlla di aver eseguito tutti i passaggi in ordine
2. Verifica che Docker Desktop sia aperto e funzionante
3. Riprova da capo dal Passo 3

---

*INGLY OS v1.0 SaaS Enterprise · Giugno 2026*
