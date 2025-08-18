
# BrainBoost — Brain Training & Cognitive Assessment (React Native / Expo)

**Project:** BrainBoost
**Team:** \[Add team names & roles here]
**Sprint:** Sprint 1 — Foundation & Memory Match prototype

---

## Table of contents

* [Project overview](#project-overview)
* [What’s included](#whats-included)
* [Folder structure & file descriptions](#folder-structure--file-descriptions)
* [Prerequisites](#prerequisites)
* [Quick start (clone & run)](#quick-start-clone--run)
* [Environment variables (.env)](#environment-variables-env)
* [Key file contents (examples)](#key-file-contents-examples)

  * `app/App.js`
  * `app/src/api/localdb.js` (SQLite helper)
  * `package.json` scripts
  * `.github/workflows/ci.yml` (CI example)
* [How to contribute (Git & PR workflow)](#how-to-contribute-git--pr-workflow)
* [Sprint 1 checklist (what to demo)](#sprint-1-checklist-what-to-demo)
* [Troubleshooting & FAQs](#troubleshooting--faqs)
* [Contacts & roles](#contacts--roles)

---

## Project overview

BrainBoost is a React Native (Expo) mobile app that provides brief brain-training games and cognitive assessments for older adults. For Sprint 1 we are building the app skeleton, onboarding/accessibility settings, and a working **Memory Match** game that stores results locally (no external cloud DB).

**Goals for Sprint 1**

* Create working Expo app skeleton
* Implement onboarding + accessibility settings (font / audio)
* Build UI + basic logic for Memory Match game
* Persist assessment results locally using SQLite
* Run 2–3 quick usability sessions and collect notes

---

## What’s included

* Expo React Native app (in `app/`)
* Local DB helpers using Expo SQLite (`app/src/api/localdb.js`)
* UI-first folder structure for games, assessments, screens, components
* Sample starter files and templates for tests, CI, and PRs

---

## Folder structure & file descriptions

```
BRAINBOOST/
├─ .gitignore
├─ README.md
├─ package.json
├─ app/
│  ├─ App.js                      # App entry — init DB, navigation
│  ├─ app.json
│  └─ src/
│     ├─ api/
│     │  ├─ localdb.js            # SQLite helper (init, save/get)
│     │  └─ localStorage.js       # AsyncStorage helpers (prefs)
│     ├─ components/              # reusable UI components (LargeButton)
│     ├─ design/                  # theme.js (colors / font sizes)
│     ├─ navigation/              # AppNavigator.js
│     ├─ screens/
│     │  ├─ Auth/                 # Welcome, Onboarding, Login, SignUp
│     │  ├─ Main/                 # Home, Profile, Settings, History
│     │  ├─ Games/                # MemoryMatch, SequenceRecall, SpotDifference, ReactionTime
│     │  └─ Assessments/          # explanation screens
│     ├─ ui/                      # small presentational components (ProgressBar)
│     ├─ hooks/                   # useFontScale, useSpeech (UI-focused)
│     ├─ contexts/                # PreferencesContext
│     ├─ data/                    # mock data for UI
│     └─ utils/                   # helpers (formatDate)
├─ assets/                         # images, icons, fonts
└─ docs/                           # research notes, UI guide
```

**Note:** This repo uses local database only (SQLite / AsyncStorage). No external DB or cloud data is used.

---

## Prerequisites

Each developer should have:

* Node.js LTS (16+ recommended)
* npm or yarn
* Expo CLI (`npm i -g expo-cli`) or use `npx expo`
* VS Code (recommended) and Git
* Phone with Expo Go app or an emulator/simulator

---

## Quick start (clone & run)

1. Clone the repo and navigate to the app folder:

   ```bash
   git clone https://github.com/<org-or-username>/brainboost.git
   cd brainboost/app
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start Expo:

   ```bash
   npx expo start
   ```

   * Scan QR with **Expo Go** on your phone or press `a` (Android emulator) / `i` (iOS simulator).

4. Create a feature branch before making changes:

   ```bash
   git checkout -b feature/<JIRA-or-short-desc>
   ```

---

## Environment variables (.env)

This project uses only local DB for Sprint 1. If you later add environment variables, please use `.env` and **do not commit** it. Add `.env.example` that shows keys expected.

Example `.env.example`:

```text
# copy to .env and fill if needed
APP_ENV=development
```

---

## Key file contents (examples)

Below are small example snippets to help members understand the initial content. Paste these into the corresponding files if they are missing.

### `app/App.js` (minimal)

```js
// app/App.js
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { initDb } from './src/api/localdb';

export default function App(){
  React.useEffect(() => {
    initDb().catch(console.warn);
  }, []);
  return <AppNavigator />;
}
```

### `app/src/api/localdb.js` (sqlite helper - shortened)

```js
// app/src/api/localdb.js
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const db = SQLite.openDatabase('braintrain.db');

function execSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(sql, params,
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });
}

export async function initDb() {
  await execSql(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, createdAt INTEGER);`);
  await execSql(`CREATE TABLE IF NOT EXISTS assessments (id TEXT PRIMARY KEY, userId TEXT, type TEXT, score INTEGER, rounds TEXT, createdAt INTEGER);`);
}

// get or create local user id
export async function getOrCreateLocalUserId() {
  const existing = await AsyncStorage.getItem('local_user_id');
  if (existing) return existing;
  const id = uuidv4();
  await AsyncStorage.setItem('local_user_id', id);
  await execSql('INSERT INTO users (id, createdAt) VALUES (?, ?)', [id, Date.now()]);
  return id;
}

// save assessment
export async function saveAssessment({ userId, type, score, rounds }) {
  const id = uuidv4();
  await execSql('INSERT INTO assessments (id, userId, type, score, rounds, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, type, score, JSON.stringify(rounds || []), Date.now()]
  );
  return id;
}
```

> If `uuid` is not installed: `npm i uuid` or use a simple timestamp id for now.

### `package.json` (scripts snippet)

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
  }
}
```

### `.github/workflows/ci.yml` (basic)

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: node-version: '18'
      - run: cd app && npm install
      - run: cd app && npm test
```

---

## How to contribute (Git & PR workflow)

1. Always **pull latest** on `main` before starting.

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/<JIRA-12>-short-desc
   ```
2. Work locally; run the app (`npx expo start`) and test changes in Expo Go.
3. Commit frequently with meaningful messages:

   ```bash
   git add .
   git commit -m "feat: add MemoryMatch UI skeleton"
   git push origin feature/<branch-name>
   ```
4. Open a **Pull Request** on GitHub. Use PR template (if present). Link Jira issue. Request at least one review from a teammate.
5. After approval and CI passing, merge into `main` (or let the repo maintainer merge).

**PR Checklist (example)**

* Linked Jira ticket
* Screenshots/GIF of UI changes
* At least one unit test added (if logic)
* Accessibility checks performed (font scaling & tap sizes)
* README updated (if needed)

---

## Sprint 1 checklist (what we should demo)

* [ ] App runs in Expo and shows onboarding flow
* [ ] Accessibility settings (font size, audio toggle) persist
* [ ] Memory Match Play screen works, calculates a basic score
* [ ] Results saved locally to SQLite and visible in History
* [ ] Export data button in Settings can create JSON (optional)
* [ ] 2–3 usability sessions completed and notes uploaded to `docs/`

---

## Troubleshooting & FAQs

\*\*Q: `expo start` fails with missing module`?**  
A: Run `npm install`inside`app/`. Check Node version and clear cache: `npx expo start -c\`.

**Q: I changed files but app doesn’t reload on device?**
A: Make sure you use the same network and QR connection; try `r` in the terminal or restart Expo.

**Q: Where are local DB records stored?**
A: SQLite DB created by Expo is on-device and local only. Use the app’s Export Data feature to create JSON for sharing.

**Q: I need to add a new package — how do I make it available to everyone?**
A: Install (e.g., `npm install package-name`) and commit `package.json` + `package-lock.json` / `yarn.lock`. Team members should run `npm install` after pulling.

---

## Contacts & roles

* **Product Owner (PO):** \[name — email]
* **Scrum Master (SM):** \[name — email]
* **Dev A (IT22206282):** \[name — email]
* **Dev B:** \[name — email]

(Replace with real names and emails in the repo README.)

---

## Final notes

* Keep PRs small and focused (one screen or feature per PR).
* Write a one-paragraph summary each week of what you worked on; add it to `docs/weekly-notes.md`.
* If you want, I can also generate:

  * a ZIP with starter files (App.js + localdb.js + navigation + MemoryMatch skeleton) ready to drop into `app/`, or
  * a CSV of Jira issues to import into your board.

Tell me which of those you want and I’ll create it.
