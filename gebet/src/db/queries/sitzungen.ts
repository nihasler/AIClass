import { getDatabase } from '../database';

export interface Sitzung {
  id: string;
  datum: string;
  dauer_sek: number;
  erstellt_am: string;
}

export async function sitzungSpeichern(
  id: string,
  datum: string,
  dauerSek: number,
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO gebetssitzungen (id, datum, dauer_sek, erstellt_am) VALUES (?, ?, ?, ?)',
    [id, datum, dauerSek, new Date().toISOString()],
  );
}

export async function alleSitzungenLaden(): Promise<Sitzung[]> {
  const db = getDatabase();
  return db.getAllAsync<Sitzung>(
    'SELECT * FROM gebetssitzungen ORDER BY datum DESC',
  );
}
