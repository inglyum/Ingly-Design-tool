# 🚀 Deploy su Railway — 5 minuti

## Cosa ottieni
- App online con URL pubblico (es. `ingly-os.up.railway.app`)
- Funziona offline come app installabile sul telefono/PC (PWA)
- Login + sistema licenze
- Database PostgreSQL incluso gratis

---

## Passo 1 — Crea account Railway
Vai su **https://railway.app** → Sign up (puoi usare GitHub)

---

## Passo 2 — Crea nuovo progetto
1. Clicca **"New Project"**
2. Scegli **"Deploy from GitHub repo"**
3. Seleziona questo repository
4. Railway rileva automaticamente Next.js → clicca **Deploy**

---

## Passo 3 — Aggiungi il Database
1. Nel progetto Railway, clicca **"+ New"**
2. Scegli **PostgreSQL**
3. Railway collega automaticamente `DATABASE_URL` al tuo servizio

---

## Passo 4 — Aggiungi le variabili d'ambiente
Vai su **Settings → Variables** e aggiungi:

```
JWT_SECRET = qualsiasi-stringa-casuale-lunga-es-abc123xyz789
```

Il `DATABASE_URL` viene aggiunto automaticamente da Railway.

---

## Passo 5 — Esegui il seed (una sola volta)
Vai su **Railway → il tuo servizio → Settings → Deploy** e nel campo **"Start Command"** cambia temporaneamente in:
```
npm run db:seed && npm start
```
Fai redeploy → dopo il primo avvio rimetti `npm start`.

Oppure usa la **Railway CLI**:
```bash
railway run npm run db:push
railway run npm run db:seed
```

---

## Accedi all'app
1. Vai sull'URL generato da Railway
2. Login: `mario@laserartstudio.it` / `Demo2026!`

---

## Installa come app (PWA)
**Chrome desktop:** clicca l'icona 💻 nella barra URL → "Installa INGLY OS"  
**iPhone:** Safari → Condividi → "Aggiungi alla schermata Home"  
**Android:** Chrome → menu ⋮ → "Aggiungi alla schermata Home"

L'app funzionerà anche **senza internet** — i dati si sincronizzano appena torni online.

---

## Test in locale
```bash
cd app
cp .env.example .env
# Modifica .env con il tuo DATABASE_URL PostgreSQL
npm install
npm run db:push
npm run db:seed
npm run dev
# Apri http://localhost:3000
```

---

## Chiavi licenza demo
- `INGLY-DEMO-2026`
- `INGLY-PRO-2026`  
- `INGLY-ENT-2026`

Inseriscile in **Impostazioni → Licenza** per attivare l'account.
