# Honda Value Passport

A Vite + React + TypeScript single-page app that generates an AI-powered resale
"Value Passport" for a Honda vehicle. The web build is also packaged as an
Android APK via [Capacitor](https://capacitorjs.com/).

- **Stack:** Vite, React 19, TypeScript, Tailwind CSS, React Router, Axios
- **Mobile:** Capacitor (Android)

---

## 1. Prerequisites

- **Node.js 20+** and **npm** (developed on Node 22)
- A running backend that serves the valuation API (see [API configuration](#3-api-configuration))
- **For building the Android APK only:**
  - **Android Studio** (includes the Android SDK) — https://developer.android.com/studio
  - **JDK 17** (bundled with recent Android Studio)

---

## 2. Install

```bash
npm install
```

---

## 3. API configuration

The frontend reads the backend URL from `VITE_API_BASE_URL` in a `.env` file at
the project root. A `.env` is already present; edit it to point at your backend:

```env
# .env
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ Vite inlines env vars **at startup**. If you change `.env`, restart the dev
> server (or rebuild) for it to take effect.

When packaged as an APK, the app runs on a device/emulator, so `localhost`
refers to the phone — point `VITE_API_BASE_URL` at a LAN IP or a public/tunnel
URL the device can reach, then rebuild.

---

## 4. Run the web app

**Development (hot reload):**

```bash
npm run dev
```

Opens on http://localhost:8080 (Vite picks the next free port if 8080 is taken).

**Production build + local preview:**

```bash
npm run build      # outputs to dist/
npm run preview     # serves the dist/ build locally
```

Other scripts: `npm run lint`, `npm run format`.

---

## 5. Build the Android APK

The web app is bundled into the native Android project (in `android/`) with
Capacitor.

### Step 1 — sync the web build into Android

```bash
npm run build:cap
```

This runs `vite build` and then `npx cap sync android`, copying the latest
`dist/` output into the Android project.

### Step 2 — produce the APK

**Option A — Android Studio (recommended):**

```bash
npx cap open android
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
When it finishes, click **locate** to find the APK.

**Option B — command line (debug APK):**

```bash
cd android
./gradlew assembleDebug
```

The APK is written to:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Install it on a connected device with:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

> A **debug** APK is signed with a debug key and is fine for testing. A
> **release** APK (`./gradlew assembleRelease`) requires your own signing
> keystore — see the [Capacitor Android docs](https://capacitorjs.com/docs/android/deploying-to-google-play).

App identity is configured in [`capacitor.config.ts`](capacitor.config.ts)
(`appId: com.honda.valueinsight`, `appName: Honda Value Insight`).

---

## 6. Project structure

```
index.html            App entry (loads src/main.tsx)
src/
  main.tsx            React + Router bootstrap
  App.tsx             Route definitions
  pages/              Route components (OwnerLayout, NewPassport)
  components/passport/ Valuation flow UI (Step1–Step4)
  service/            API client (api.ts) + valuation mapping (valuation.ts)
  lib/                Shared types
  styles.css          Tailwind + theme
android/              Capacitor Android project
capacitor.config.ts   Capacitor config (webDir: dist)
```
