# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the `gebet/` directory:

```bash
cd gebet

# Start dev server (opens Expo Go QR)
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android

# Install dependencies
npm install
```

There are no tests in this project.

## Architecture

### App Initialization Flow
`LoadingScreen` is the entry point — it opens the SQLite database (running any pending migrations), loads all stores in parallel, sets up notifications, then immediately replaces itself with `MainTabNavigator`. Navigation never returns to `LoadingScreen`.

### Data Layer
- **`src/db/database.ts`**: Singleton `openDatabase()` / `getDatabase()`. Must call `openDatabase()` before any queries. Migration runner checks `PRAGMA user_version` and runs only missing migrations sequentially.
- **`src/db/migrations/`**: Version-numbered migration files (v1–v4). When adding a migration, increment `LATEST_VERSION` in `database.ts`, create the migration file, and add it to the runner.
- **`src/db/queries/`**: Raw SQL query functions, one file per domain (`anliegen`, `journal`, `kategorien`, `sitzungen`, `streak`).

### State Management
Zustand stores (`src/store/`) are thin wrappers around DB query functions. The pattern is: call the DB query, then reload from DB to refresh store state. Stores are loaded once at startup via `LoadingScreen` and kept in sync after mutations.

### Navigation
- `RootNavigator` (native stack): `Laden` → `Haupt` | `Gebetssitzung` (modal)
- `MainTabNavigator` (bottom tabs): `Heute` | `Anliegen` | `Journal` | `Einstellungen`
- `AnliegenStackNavigator`: `AnliegenListe` → `AnliegenDetail` | `AnliegenFormular`
- `JournalStackNavigator`: `JournalListe` → `JournalDetail` | `JournalFormular`

### Session Selection Logic
`src/services/sitzungsAuswahl.ts` — pure function `waehleSitzungsAnliegen()` that filters active Anliegen (not answered, not archived, `inSitzung=true`), rotates by `zuletztGebetetAm` (least-recently-prayed first), then applies per-category and total limits from settings.

### Settings Persistence
Settings use a key-value `einstellungen` table (created in v1, expanded in v4). The `useSettingsStore` reads/writes individual keys. The v4 migration adds `sitzung_anzahl` and `sitzung_pro_kategorie` keys.

## Design System

All UI is in **German**. Use existing component vocabulary:
- `AppText` with `variant` prop (`heading1`, `heading2`, `body`, `caption`, etc.)
- `AppButton`, `AppCard`, `AppInput`, `EmptyState` from `src/components/common/`
- Colors from `src/constants/colors.ts` — primary accent: `terrakotta` (#C97D5B), secondary: `salbei` (#7A9E7E), background: `bgPrimary` (#FAF7F2)
- Fonts: Lora (headings) + Inter (body), loaded via expo-google-fonts at startup

## Key Conventions
- IDs are generated with `react-native-uuid` (`uuid.v4()`)
- Dates stored as ISO strings
- Boolean fields stored as `INTEGER` (0/1) in SQLite
- All user-facing strings are German
