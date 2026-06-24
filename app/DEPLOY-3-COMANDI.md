# Deploy online — 3 comandi

## Prima di tutto — crea account Railway (1 sola volta)
Vai su **https://railway.app** → Sign up → usa la tua email → conferma l'email

---

## Apri il terminale e copia questi 3 comandi, uno alla volta:

### Comando 1 — Installa Railway
```bash
npm install -g @railway/cli
```

### Comando 2 — Fai login (si apre il browser in automatico)
```bash
railway login
```

### Comando 3 — Deploy in un click (dalla cartella app/)
```bash
cd app && railway up
```

---

## Dopo il deploy — 2 cose da fare su Railway.app

### 1. Aggiungi il database
- Vai su **railway.app** → apri il tuo progetto
- Clicca **"+ New"** → **"Database"** → **"PostgreSQL"**

### 2. Aggiungi 1 variabile
- Clicca sul tuo servizio → tab **"Variables"**
- Aggiungi: `JWT_SECRET` = `ingly2026xyz`

### 3. Crea i dati demo (una volta sola)
- Clicca tab **"Settings"** → campo **"Start Command"**
- Cambia in: `npm run db:push && npm run db:seed && npm start`
- Aspetta che finisca → rimetti: `npm start`

---

## Pronto!
Railway ti dà un URL tipo `xxx.up.railway.app` — condividilo con i clienti.

**Login demo:** `mario@laserartstudio.it` / `Demo2026!`
