import { SQLiteDatabase } from 'expo-sqlite';

export async function v1_initial(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS anliegen (
      id            TEXT PRIMARY KEY NOT NULL,
      titel         TEXT NOT NULL,
      beschreibung  TEXT,
      kategorie     TEXT NOT NULL DEFAULT 'allgemein',
      erhoert       INTEGER NOT NULL DEFAULT 0,
      erhoert_am    TEXT,
      notiz_erhoert TEXT,
      erstellt_am   TEXT NOT NULL,
      geaendert_am  TEXT NOT NULL,
      archiviert    INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_anliegen_kategorie ON anliegen(kategorie);
    CREATE INDEX IF NOT EXISTS idx_anliegen_erhoert ON anliegen(erhoert);
    CREATE INDEX IF NOT EXISTS idx_anliegen_erstellt ON anliegen(erstellt_am DESC);

    CREATE TABLE IF NOT EXISTS journal_eintraege (
      id          TEXT PRIMARY KEY NOT NULL,
      titel       TEXT,
      inhalt      TEXT NOT NULL,
      datum       TEXT NOT NULL,
      stimmung    TEXT,
      anliegen_id TEXT REFERENCES anliegen(id),
      erstellt_am TEXT NOT NULL,
      geaendert_am TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_journal_datum ON journal_eintraege(datum DESC);
    CREATE INDEX IF NOT EXISTS idx_journal_anliegen_id ON journal_eintraege(anliegen_id);

    CREATE TABLE IF NOT EXISTS gebetstage (
      datum TEXT PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS einstellungen (
      schluessel TEXT PRIMARY KEY NOT NULL,
      wert       TEXT NOT NULL
    );

    INSERT OR IGNORE INTO einstellungen (schluessel, wert) VALUES
      ('erinnerung_aktiv', '1'),
      ('erinnerung_stunde', '20'),
      ('erinnerung_minute', '0'),
      ('haptik_aktiv', '1');
  `);
}
