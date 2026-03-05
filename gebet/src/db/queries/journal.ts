import { getDatabase } from '../database';
import { JournalEintrag, Stimmung } from '../../types/prayer';

function rowToEintrag(row: any): JournalEintrag {
  return {
    id: row.id,
    titel: row.titel ?? undefined,
    inhalt: row.inhalt,
    datum: row.datum,
    stimmung: row.stimmung as Stimmung | undefined,
    anliegenId: row.anliegen_id ?? undefined,
    erstelltAm: row.erstellt_am,
    geaendertAm: row.geaendert_am,
  };
}

export async function alleEintraegeladen(): Promise<JournalEintrag[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM journal_eintraege ORDER BY datum DESC, erstellt_am DESC'
  );
  return rows.map(rowToEintrag);
}

export async function eintragNachIdLaden(id: string): Promise<JournalEintrag | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM journal_eintraege WHERE id = ?',
    [id]
  );
  return row ? rowToEintrag(row) : null;
}

export async function eintraegeNachAnliegenLaden(anliegenId: string): Promise<JournalEintrag[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM journal_eintraege WHERE anliegen_id = ? ORDER BY datum DESC',
    [anliegenId]
  );
  return rows.map(rowToEintrag);
}

export async function eintragEinfuegen(eintrag: Omit<JournalEintrag, 'erstelltAm' | 'geaendertAm'>): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO journal_eintraege (id, titel, inhalt, datum, stimmung, anliegen_id, erstellt_am, geaendert_am)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      eintrag.id,
      eintrag.titel ?? null,
      eintrag.inhalt,
      eintrag.datum,
      eintrag.stimmung ?? null,
      eintrag.anliegenId ?? null,
      now,
      now,
    ]
  );
}

export async function eintragAktualisieren(id: string, data: Partial<JournalEintrag>): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE journal_eintraege SET
       titel = ?,
       inhalt = COALESCE(?, inhalt),
       stimmung = ?,
       anliegen_id = ?,
       geaendert_am = ?
     WHERE id = ?`,
    [
      data.titel !== undefined ? (data.titel ?? null) : null,
      data.inhalt ?? null,
      data.stimmung !== undefined ? (data.stimmung ?? null) : null,
      data.anliegenId !== undefined ? (data.anliegenId ?? null) : null,
      now,
      id,
    ]
  );
}

export async function eintragLoeschen(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM journal_eintraege WHERE id = ?', [id]);
}
