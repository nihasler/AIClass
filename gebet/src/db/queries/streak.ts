import { getDatabase } from '../database';

export async function alleGebetstage(): Promise<string[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ datum: string }>(
    'SELECT datum FROM gebetstage ORDER BY datum ASC'
  );
  return rows.map((r) => r.datum);
}

export async function gebetstageAufzeichnen(datum: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO gebetstage (datum) VALUES (?)',
    [datum]
  );
}

export async function einstellungLaden(schluessel: string): Promise<string | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ wert: string }>(
    'SELECT wert FROM einstellungen WHERE schluessel = ?',
    [schluessel]
  );
  return row?.wert ?? null;
}

export async function einstellungSpeichern(schluessel: string, wert: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO einstellungen (schluessel, wert) VALUES (?, ?)',
    [schluessel, wert]
  );
}

export async function alleEinstellungen(): Promise<Record<string, string>> {
  const db = getDatabase();
  const rows = await db.getAllAsync<{ schluessel: string; wert: string }>(
    'SELECT schluessel, wert FROM einstellungen'
  );
  return Object.fromEntries(rows.map((r) => [r.schluessel, r.wert]));
}
