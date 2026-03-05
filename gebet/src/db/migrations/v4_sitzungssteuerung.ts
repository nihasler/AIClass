import { SQLiteDatabase } from 'expo-sqlite';

export async function v4_sitzungssteuerung(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    ALTER TABLE anliegen ADD COLUMN in_sitzung INTEGER NOT NULL DEFAULT 1;
    ALTER TABLE anliegen ADD COLUMN zuletzt_gebetet_am TEXT;
    INSERT OR IGNORE INTO einstellungen (schluessel, wert) VALUES
      ('sitzung_anzahl', '0'),
      ('sitzung_pro_kategorie', '0');
  `);
}
