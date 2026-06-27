# 🏆 WM 2026 Tippspiel

Tippspiel-App für die FIFA Weltmeisterschaft 2026 in den USA, Mexiko und Kanada.

## Features

- **48 Teams** in 12 Gruppen mit Gruppentabellen (Sp/S/U/N/Tore/Pkt)
- **Mehrspieler** — Amélie, Raffi, Stefan, Marika als Default + weitere hinzufügbar
- **Tipp-Eingabe** für jedes Spiel mit automatischer Auswertung
- **Punktesystem**: 4 Pkt (exakt), 3 Pkt (Tordifferenz), 2 Pkt (Tendenz), 0 Pkt (falsch)
- **Joker-System** — 3 Joker pro Spieler für doppelte Punkte
- **Turniertipps** — Weltmeister, Torschützenkönig, bestes Gruppenteam
- **Live-Ranking** mit Abstand zum Führenden
- **Statistiken** — Trefferquote, Durchschnitt, bester Tipper des Tages
- **Tipp-Vergleich** — Tipps aller Spieler nebeneinander
- **Deadline-Logik** — Tipps werden am Spieltag automatisch gesperrt
- **Firebase Sync** — Echtzeit-Synchronisierung zwischen Mitspielern

## Setup

```bash
npm install
npm run dev
```

## Deploy (Vercel)

1. Repo auf GitHub pushen
2. Auf [vercel.com](https://vercel.com) importieren
3. Framework: **Vite** → Deploy

## Firebase Sync einrichten

1. Firebase-Projekt erstellen: [console.firebase.google.com](https://console.firebase.google.com)
2. **Realtime Database** erstellen
3. Regeln setzen:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
4. URL kopieren und in der App unter **👥 Spieler → Firebase Sync** eintragen
5. Alle Mitspieler verwenden dieselbe URL

## Ergebnisse aktualisieren

Spielergebnisse befinden sich im `MATCHES`-Array in `src/App.jsx`. Das Feld `r` enthält das Ergebnis als `[Heim, Auswärts]` oder `null` falls noch nicht gespielt.

## Tech Stack

- React 18 + Vite
- Firebase Realtime Database (REST API, kein SDK nötig)
- localStorage für Offline-Speicherung
