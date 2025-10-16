# 🚀 Deployment Guide: Trigger-Tagebuch mit KI-Coach

## Schritt 1: Vorbereitung

### 1.1 Netlify CLI installieren
```bash
npm install -g netlify-cli
```

### 1.2 Dateien ins Projekt kopieren
```
trigger-tagebuch/
├── netlify.toml              ← Config-Datei (root)
└── netlify/
    └── functions/
        └── motivational-coach.js  ← Serverless Function
```

### 1.3 Dependencies installieren
```bash
# Im Projekt-Root:
npm install @anthropic-ai/sdk

# Für Angular HttpClient (falls noch nicht vorhanden):
# In app.config.ts: provideHttpClient() hinzufügen
```

### 1.4 package.json erweitern
```json
{
  "scripts": {
    "build": "ng build --configuration production",
    "deploy": "netlify deploy --prod"
  }
}
```

---

## Schritt 2: GitHub Repository erstellen

```bash
# Im Projekt-Verzeichnis:
git init
git add .
git commit -m "Initial commit"

# GitHub Repo erstellen (auf github.com)
git remote add origin https://github.com/DEIN-USERNAME/trigger-tagebuch.git
git push -u origin main
```

---

## Schritt 3: Netlify Setup

### 3.1 Netlify Account erstellen
- Gehe zu [netlify.com](https://netlify.com)
- Sign up (kostenlos)

### 3.2 Neues Projekt verbinden
1. "Add new site" → "Import an existing project"
2. GitHub verbinden
3. Repository auswählen: `trigger-tagebuch`
4. Build Settings werden automatisch erkannt (aus netlify.toml)
5. "Deploy site" klicken

### 3.3 Environment Variables setzen
1. Site Settings → Environment Variables
2. Neue Variable hinzufügen:
  - **Key:** `CLAUDE_API_KEY`
  - **Value:** `sk-ant-api03-...` (dein Claude API Key)
  - **Scope:** All scopes

---

## Schritt 4: Claude API Key bekommen

### 4.1 Anthropic Console
1. Gehe zu [console.anthropic.com](https://console.anthropic.com)
2. Registriere dich / Login
3. API Keys → "Create Key"
4. Kopiere den Key (beginnt mit `sk-ant-api03-...`)

### 4.2 Credits aufladen
- Minimum: $5 (reicht für ~1000-2000 Gespräche!)
- Empfehlung für Tests: $10-20

---

## Schritt 5: Deploy!

### Option A: Automatisch (bei jedem Git Push)
```bash
git add .
git commit -m "Add feature"
git push

# Netlify deployed automatisch! 🎉
```

### Option B: Manuell über CLI
```bash
npm run build
netlify deploy --prod
```

---

## Schritt 6: Testen

### 6.1 URL aufrufen
```
https://DEIN-SITE-NAME.netlify.app
```

### 6.2 Coach testen
- Dashboard öffnen
- "KI-Coach fragen" Button (wenn implementiert)
- Oder direkt Function testen:

```bash
# Lokales Testen:
netlify dev

# Function aufrufen:
curl -X POST http://localhost:8888/.netlify/functions/motivational-coach \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "Motiviere mich!", "context": null}'
```

---

## 💰 Kosten-Übersicht

### Netlify (Free Tier)
- ✅ 125k Function Requests / Monat
- ✅ 100 GB Bandwidth
- ✅ Automatisches HTTPS
- **Kosten:** $0

### Claude API (Pay-as-you-go)
- **Claude Sonnet 4:** ~$3 / 1M Input Tokens, ~$15 / 1M Output Tokens
- **Pro Gespräch:** ~$0.005 - 0.01 (500-1000 Token)
- **$10 reicht für:** ~1000-2000 Coaching-Gespräche
- **Kosten:** $5 Minimum

**Total für Start:** ~$5-10 einmalig

---

## 🔒 Sicherheit

### API Key Schutz
✅ API Key ist **nie** im Frontend
✅ Nur Netlify Functions haben Zugriff
✅ Environment Variables sind verschlüsselt

### Rate Limiting (optional)
```javascript
// In motivational-coach.js ergänzen:
const rateLimitMap = new Map();

export default async (req, context) => {
  const ip = req.headers.get('x-forwarded-for');
  
  // Max 10 Requests pro Stunde pro IP
  const requests = rateLimitMap.get(ip) || 0;
  if (requests > 10) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  
  rateLimitMap.set(ip, requests + 1);
  // ... rest of code
}
```

---

## 🐛 Troubleshooting

### Function gibt 500 Error
1. Netlify Dashboard → Functions → Logs prüfen
2. API Key korrekt gesetzt? (Environment Variables)
3. Anthropic Credits vorhanden?

### Build schlägt fehl
1. `netlify.toml` im root-Verzeichnis?
2. `npm run build` lokal testen
3. Node Version prüfen (mind. 18)

### CORS Fehler
- Netlify Functions haben automatisch CORS enabled
- Falls Problem: Headers in Function Response setzen

---

## 🎯 Nächste Schritte

Nach erfolgreichem Deployment kannst du:

1. **Coach-UI bauen:**
  - Chat-Interface erstellen
  - "Frag den Coach" Button im Dashboard
  - Tägliche Motivation anzeigen

2. **Erweiterte Features:**
  - Conversational Memory (bisherige Nachrichten speichern)
  - Streaming Responses (wie ChatGPT)
  - Voice Input für Coach

3. **PWA machen:**
  - Manifest.json hinzufügen
  - Service Worker für Offline
  - "Add to Home Screen"

---

## ✅ Checklist

- [ ] netlify.toml im Projekt-Root
- [ ] Netlify Functions Ordner erstellt
- [ ] GitHub Repository erstellt & pushed
- [ ] Netlify Account & Site erstellt
- [ ] CLAUDE_API_KEY Environment Variable gesetzt
- [ ] Anthropic Credits aufgeladen
- [ ] Erfolgreich deployed
- [ ] Function auf Production getestet
- [ ] App auf Handy getestet

**Du bist bereit! 🚀**
