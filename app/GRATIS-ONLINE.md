# Metti online GRATIS — Vercel + Neon (15 minuti, zero costi)

---

## PARTE 1 — Database gratuito su Neon (5 minuti)

### 1. Crea account Neon
👉 Vai su **https://neon.tech** → clicca **"Sign Up"** → usa Google o GitHub

### 2. Crea il database
- Clicca **"Create Project"**
- Nome: `ingly-os` → clicca **"Create Project"**

### 3. Copia il link del database
- Nella pagina del progetto vedi **"Connection string"**
- Clicca l'icona 📋 per copiarlo
- Sembra così: `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`
- **Salvalo** — ti servirà tra poco

---

## PARTE 2 — App gratuita su Vercel (5 minuti)

### 4. Crea account Vercel
👉 Vai su **https://vercel.com** → clicca **"Sign Up"** → usa lo stesso GitHub

### 5. Importa il progetto
- Clicca **"Add New Project"**
- Cerca **"ingly-design-tool"** → clicca **"Import"**

### 6. Imposta la cartella corretta
- In **"Root Directory"** scrivi: `app`
- Clicca **"Edit"** accanto a Root Directory se non lo vedi

### 7. Aggiungi le variabili (importante!)
Clicca **"Environment Variables"** e aggiungi queste 2:

| Nome | Valore |
|---|---|
| `DATABASE_URL` | il link copiato da Neon (passo 3) |
| `JWT_SECRET` | `ingly2026segreto` |

### 8. Deploy!
- Clicca **"Deploy"**
- Aspetta 2-3 minuti ⏳
- Quando vedi 🎉 **"Congratulations!"** → hai il tuo URL!

---

## PARTE 3 — Crea i dati demo (1 minuto)

### 9. Apri questo link nel browser
Sostituisci `IL-TUO-URL` con l'URL che ti ha dato Vercel:

```
https://IL-TUO-URL.vercel.app/api/setup?key=setup2026
```

Esempio: `https://ingly-os-mrgiu.vercel.app/api/setup?key=setup2026`

Vedrai questo messaggio:
```
{"ok":true,"message":"🎉 Setup completato!","credentials":{"email":"mario@laserartstudio.it","password":"Demo2026!"}}
```

---

## FATTO! 🎉

Vai su `https://IL-TUO-URL.vercel.app` e accedi con:
- **Email:** mario@laserartstudio.it
- **Password:** Demo2026!

### L'URL funziona da:
- 💻 Computer (Windows, Mac, Linux)
- 📱 Telefono (Android, iPhone)
- Qualsiasi browser

### Condividi con i clienti:
Manda semplicemente il link `https://IL-TUO-URL.vercel.app`

---

## Se qualcosa non va

| Problema | Soluzione |
|---|---|
| "Build failed" | Controlla che Root Directory sia `app` |
| "Prisma error" | Controlla che DATABASE_URL sia corretto (deve iniziare con `postgresql://`) |
| Login non funziona | Apri di nuovo il link `/api/setup?key=setup2026` |
| Pagina bianca | Aspetta 1 minuto e ricarica |

---

*Neon gratis: database fino a 500MB. Vercel gratis: illimitato per uso personale.*
