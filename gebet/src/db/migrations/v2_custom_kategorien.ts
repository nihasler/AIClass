import { SQLiteDatabase } from 'expo-sqlite';

export async function v2_custom_kategorien(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS custom_kategorien (
      id    TEXT PRIMARY KEY NOT NULL,
      label TEXT NOT NULL,
      farbe TEXT NOT NULL
    );
  `);
}
