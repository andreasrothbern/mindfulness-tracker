# Trigger-Tagebuch App - Angular 18

Eine moderne Angular-Anwendung zum Erfassen und Auswerten von Cravings und Triggern bei Suchtbewältigung.

## 🚀 Features

- ✅ **Trigger-Erfassungsformular** mit umfangreichen Feldern
- 📊 **Dashboard** mit Statistiken und Visualisierungen
- 📈 **Zeitbasierte Auswertungen** (Woche, Monat, Alle)
- 💾 **LocalStorage-Persistierung** (keine Backend erforderlich)
- 📤 **Export/Import** der Daten als JSON
- 🎨 **Modernes, responsives Design**
- ⚡ **Angular 18** mit Standalone Components und Signals

## 📋 Voraussetzungen

- Node.js (v18 oder höher)
- npm oder yarn
- Angular CLI (`npm install -g @angular/cli`)

## 🛠️ Installation

### 1. Projekt erstellen

```bash
# Neues Angular 18 Projekt erstellen
ng new trigger-tagebuch --standalone --routing --style=scss

# In Projekt-Verzeichnis wechseln
cd trigger-tagebuch
```

### 2. Komponenten und Services generieren

```bash
# Komponenten erstellen
ng generate component components/trigger-form --standalone
ng generate component components/dashboard --standalone

# Service erstellen
ng generate service services/trigger

# Interface erstellen
ng generate interface models/trigger-entry
```

### 3. Code-Dateien einfügen

Kopiere nun alle bereitgestellten Code-Dateien in die entsprechenden Verzeichnisse:

**Models:**
- `src/app/models/trigger-entry.model.ts`

**Services:**
- `src/app/services/trigger.service.ts`

**Components:**
- `src/app/components/trigger-form/trigger-form.component.ts`
- `src/app/components/trigger-form/trigger-form.component.html`
- `src/app/components/trigger-form/trigger-form.component.scss`
- `src/app/components/dashboard/dashboard.component.ts`
- `src/app/components/dashboard/dashboard.component.html`
- `src/app/components/dashboard/dashboard.component.scss`

**Root Files:**
- `src/app/app.component.ts`
- `src/app/app.routes.ts`
- `src/app/app.config.ts`
- `src/styles.scss`

### 4. App starten

```bash
ng serve
```

Die App läuft nun auf: **http://localhost:4200**

## 📁 Projektstruktur

```
trigger-tagebuch/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── trigger-entry.model.ts
│   │   ├── services/
│   │   │   └── trigger.service.ts
│   │   ├── components/
│   │   │   ├── trigger-form/
│   │   │   │   ├── trigger-form.component.ts
│   │   │   │   ├── trigger-form.component.html
│   │   │   │   └── trigger-form.component.scss
│   │   │   └── dashboard/
│   │   │       ├── dashboard.component.ts
│   │   │       ├── dashboard.component.html
│   │   │       └── dashboard.component.scss
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── styles.scss
│   └── index.html
└── package.json
```

## 🎯 Verwendung

### Neuen Trigger-Eintrag erstellen

1. Navigiere zu "Neuer Eintrag" oder öffne `/form`
2. Fülle alle erforderlichen Felder aus:
  - Datum & Uhrzeit
  - Intensität des Cravings (1-10)
  - Situation & Ort
  - Emotionaler Zustand
  - Körperliche Signale
  - Auslöser
  - Bewältigungsstrategie
  - Ergebnis
  - Reflexion & Notizen
3. Klicke auf "Eintrag speichern"

### Dashboard verwenden

Das Dashboard bietet folgende Funktionen:

**Statistiken:**
- Gesamtanzahl Cravings
- Erfolgreich bewältigte Cravings
- Erfolgsquote in Prozent
- Durchschnittliche Intensität
- Durchschnittliche Dauer

**Insights:**
- Häufigste Trigger
- Häufigste Emotionen
- Häufigste Tageszeiten
- Wirksamste Bewältigungsstrategien

**Zeitfilter:**
- Letzte Woche
- Letzter Monat
- Alle Einträge

**Aktionen:**
- Export der Daten als JSON
- Import von gespeicherten Daten
- Löschen einzelner Einträge

## 💾 Datenspeicherung

Die App speichert alle Daten im **LocalStorage** des Browsers:
- ✅ Keine Internetverbindung erforderlich
- ✅ Maximaler Datenschutz (Daten bleiben lokal)
- ⚠️ Daten sind browser-spezifisch
- ⚠️ Bei Browser-Daten löschen gehen Einträge verloren

**Empfehlung:** Nutze die Export-Funktion regelmäßig, um Backups zu erstellen!

## 🔧 Technologien

- **Angular 18** - Framework
- **TypeScript** - Programmiersprache
- **SCSS** - Styling
- **Signals** - Reaktives State Management
- **Standalone Components** - Moderne Angular-Architektur
- **LocalStorage API** - Datenpersistierung

## 🎨 Anpassungen

### Farben ändern

Bearbeite die Farben in den SCSS-Dateien:
- Primärfarbe: `#3498db` (Blau)
- Erfolg: `#4caf50` (Grün)
- Warnung: `#f39c12` (Orange)
- Fehler: `#e74c3c` (Rot)

### Weitere Felder hinzufügen

1. Erweitere das Interface in `trigger-entry.model.ts`
2. Füge das Feld im FormBuilder hinzu (`trigger-form.component.ts`)
3. Ergänze das HTML-Template (`trigger-form.component.html`)
4. Passe das Dashboard an, falls nötig

## 🚀 Deployment

### Build für Production

```bash
ng build --configuration production
```

Die fertigen Dateien befinden sich in `dist/trigger-tagebuch/`.

### Deployment-Optionen

- **Netlify / Vercel:** Einfach das `dist/` Verzeichnis hochladen
- **GitHub Pages:** `ng add angular-cli-ghpages` und `ng deploy`
- **Firebase Hosting:** `ng add @angular/fire` und `ng deploy`

## 📝 Nächste Schritte (Erweiterungsmöglichkeiten)

- [ ] PDF-Export der Statistiken
- [ ] Diagramme mit Chart.js oder D3.js
- [ ] Push-Benachrichtigungen für Meditationszeiten
- [ ] Cloud-Sync mit Backend (optional)
- [ ] KI-Unterstützung für Motivations-Coaching
- [ ] Kalender-Integration für Bewältigungsplan

## 🤝 Support

Bei Fragen oder Problemen:
1. Überprüfe die Konsole auf Fehler (`F12` im Browser)
2. Stelle sicher, dass alle Dateien korrekt platziert sind
3. Lösche `node_modules/` und führe `npm install` erneut aus

## 📄 Lizenz

Dieses Projekt ist für persönlichen Gebrauch erstellt.

---

**Viel Erfolg bei deiner Entwöhnung! 💪 Du schaffst das!**
