import { SQLiteDatabase } from 'expo-sqlite';

export async function v3_gebetssitzungen(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS gebetssitzungen (
      id           TEXT PRIMARY KEY NOT NULL,
      datum        TEXT NOT NULL,
      dauer_sek    INTEGER NOT NULL,
      erstellt_am  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sitzungen_datum ON gebetssitzungen(datum DESC);
  `);
}
