import { getDatabase } from '../database';

export interface CustomKategorie {
  id: string;
  label: string;
  farbe: string;
}

export async function alleCustomKategorienLaden(): Promise<CustomKategorie[]> {
  const db = getDatabase();
  return db.getAllAsync<CustomKategorie>(
    'SELECT id, label, farbe FROM custom_kategorien ORDER BY label ASC'
  );
}

export async function customKategorieHinzufuegen(id: string, label: string, farbe: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    'INSERT INTO custom_kategorien (id, label, farbe) VALUES (?, ?, ?)',
    [id, label, farbe]
  );
}

export async function customKategorieLoeschen(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM custom_kategorien WHERE id = ?', [id]);
}
