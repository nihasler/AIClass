import { getDatabase } from '../database';
import { Anliegen, Kategorie } from '../../types/prayer';

function rowToAnliegen(row: any): Anliegen {
  return {
    id: row.id,
    titel: row.titel,
    beschreibung: row.beschreibung ?? undefined,
    kategorie: row.kategorie as Kategorie,
    erhoert: row.erhoert === 1,
    erhoertAm: row.erhoert_am ?? undefined,
    notizErhoert: row.notiz_erhoert ?? undefined,
    erstelltAm: row.erstellt_am,
    geaendertAm: row.geaendert_am,
    archiviert: row.archiviert === 1,
    inSitzung: row.in_sitzung !== 0,
    zuletztGebetetAm: row.zuletzt_gebetet_am ?? undefined,
  };
}

export async function alleAnliegenLaden(): Promise<Anliegen[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM anliegen ORDER BY erstellt_am DESC'
  );
  return rows.map(rowToAnliegen);
}

export async function anliegenNachIdLaden(id: string): Promise<Anliegen | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM anliegen WHERE id = ?', [id]);
  return row ? rowToAnliegen(row) : null;
}

export async function anliegenEinfuegen(anliegen: Omit<Anliegen, 'erstelltAm' | 'geaendertAm'>): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO anliegen (id, titel, beschreibung, kategorie, erhoert, erhoert_am, notiz_erhoert, erstellt_am, geaendert_am, archiviert, in_sitzung, zuletzt_gebetet_am)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NULL)`,
    [
      anliegen.id,
      anliegen.titel,
      anliegen.beschreibung ?? null,
      anliegen.kategorie,
      anliegen.erhoert ? 1 : 0,
      anliegen.erhoertAm ?? null,
      anliegen.notizErhoert ?? null,
      now,
      now,
      anliegen.archiviert ? 1 : 0,
    ]
  );
}

export async function anliegenAktualisieren(id: string, data: Partial<Anliegen>): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE anliegen SET
       titel = COALESCE(?, titel),
       beschreibung = ?,
       kategorie = COALESCE(?, kategorie),
       erhoert = COALESCE(?, erhoert),
       erhoert_am = ?,
       notiz_erhoert = ?,
       archiviert = COALESCE(?, archiviert),
       in_sitzung = COALESCE(?, in_sitzung),
       geaendert_am = ?
     WHERE id = ?`,
    [
      data.titel ?? null,
      data.beschreibung !== undefined ? (data.beschreibung ?? null) : null,
      data.kategorie ?? null,
      data.erhoert !== undefined ? (data.erhoert ? 1 : 0) : null,
      data.erhoertAm !== undefined ? (data.erhoertAm ?? null) : null,
      data.notizErhoert !== undefined ? (data.notizErhoert ?? null) : null,
      data.archiviert !== undefined ? (data.archiviert ? 1 : 0) : null,
      data.inSitzung !== undefined ? (data.inSitzung ? 1 : 0) : null,
      now,
      id,
    ]
  );
}

export async function anliegenAlsErhoertMarkieren(id: string, notiz?: string): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE anliegen SET erhoert = 1, erhoert_am = ?, notiz_erhoert = ?, geaendert_am = ? WHERE id = ?`,
    [now.split('T')[0], notiz ?? null, now, id]
  );
}

export async function anliegenArchivieren(id: string): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE anliegen SET archiviert = 1, geaendert_am = ? WHERE id = ?`,
    [now, id]
  );
}

export async function anliegenGebetetAktualisieren(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = getDatabase();
  const now = new Date().toISOString();
  const placeholders = ids.map(() => '?').join(', ');
  await db.runAsync(
    `UPDATE anliegen SET zuletzt_gebetet_am = ? WHERE id IN (${placeholders})`,
    [now, ...ids]
  );
}
