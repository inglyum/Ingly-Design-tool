# Metti INGLY OS online — Guida passo per passo

**Tempo: circa 10 minuti. Non serve installare niente.**

---

## PASSO 1 — Crea account gratuito su Railway

1. Apri il browser e vai su → **https://railway.app**
2. Clicca il pulsante verde **"Start a New Project"**
3. Clicca **"Login with GitHub"**
4. Se non hai GitHub: clicca **"Create an account"** → crea account con la tua email → torna su Railway e ripeti
5. Autorizza Railway ad accedere a GitHub → clicca **"Authorize railway-app"**

✅ Sei dentro Railway.

---

## PASSO 2 — Collega il tuo progetto

1. Clicca il pulsante **"New Project"** (in alto a destra)
2. Clicca **"Deploy from GitHub repo"**
3. Clicca **"Configure GitHub App"** → seleziona la tua organizzazione → clicca **"Install & Authorize"**
4. Torna su Railway, cerca e clicca il tuo repository **"ingly-design-tool"**
5. Railway mostra una schermata di deploy → **NON cliccare ancora Deploy**

---

## PASSO 3 — Imposta la cartella corretta

Prima di fare deploy, devi dire a Railway di usare la cartella `app/`:

1. Nella schermata di deploy, clicca **"Configure"** (o l'icona ingranaggio ⚙️)
2. Cerca il campo **"Root Directory"**
3. Scrivi: `app`
4. Clicca **"Save"**

---

## PASSO 4 — Aggiungi il Database

1. Nel tuo progetto Railway, clicca **"+ New"** (in alto)
2. Clicca **"Database"**
3. Clicca **"Add PostgreSQL"**
4. Railway crea automaticamente il database ✅

---

## PASSO 5 — Aggiungi la chiave segreta

1. Clicca sul tuo servizio (l'app Next.js, non il database)
2. Clicca la tab **"Variables"**
3. Clicca **"New Variable"**
4. Nel campo **NAME** scrivi: `JWT_SECRET`
5. Nel campo **VALUE** scrivi: `ingly2026supersegretoXYZ` (qualsiasi cosa, cambiala tu)
6. Clicca **"Add"**

---

## PASSO 6 — Fai il Deploy

1. Clicca la tab **"Deployments"**
2. Clicca **"Deploy Now"** (o **"Redeploy"**)
3. Aspetta 2-3 minuti mentre la barra di avanzamento completa ⏳
4. Quando vedi ✅ **"Success"** → il deploy è riuscito!

---

## PASSO 7 — Apri l'URL

1. Clicca la tab **"Settings"**
2. Cerca **"Domains"** → clicca **"Generate Domain"**
3. Railway ti dà un URL tipo: `ingly-os-production.up.railway.app`
4. Clicca quel link → si apre la tua app! 🎉

---

## PASSO 8 — Crea i dati demo (una sola volta)

1. Nel tuo servizio su Railway, clicca la tab **"Settings"**
2. Cerca il campo **"Start Command"**
3. Cambia il testo in: `npm run db:push && npm run db:seed && npm start`
4. Clicca **"Save"** → Railway si riavvia automaticamente
5. Aspetta che finisca (1-2 minuti)
6. **Importante:** Torna e rimetti il comando originale: `npm start` → clicca **Save**

---

## PASSO 9 — Accedi all'app

Vai al tuo URL Railway e accedi con:

| Campo | Valore |
|---|---|
| **Email** | mario@laserartstudio.it |
| **Password** | Demo2026! |

---

## Cosa puoi fare ora

- **Condividi l'URL** con i tuoi clienti — funziona su telefono e computer
- **Installa come app sul telefono**: apri l'URL con Chrome su Android → menu ⋮ → "Aggiungi alla schermata Home"
- **Installa su iPhone**: Safari → pulsante Condividi → "Aggiungi alla schermata Home"
- **Funziona offline**: una volta aperta, funziona anche senza internet

---

## Attiva la licenza

1. Accedi all'app
2. Vai su **Impostazioni** (menu a sinistra)
3. Scrivi nel campo licenza: `INGLY-DEMO-2026`
4. Clicca **Attiva**

---

## Se qualcosa non funziona

| Problema | Soluzione |
|---|---|
| "Build failed" | Controlla che Root Directory sia impostato su `app` |
| Pagina bianca | Aspetta 1 minuto e ricarica la pagina |
| "Database error" | Il Passo 8 (seed) non è stato fatto — ripetilo |
| Login non funziona | Ripeti il Passo 8 |

---

*In caso di difficoltà: fai uno screenshot e mostrami — ti aiuto subito.*
