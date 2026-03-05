import * as SQLite from 'expo-sqlite';
import { v1_initial } from './migrations/v1_initial';
import { v2_custom_kategorien } from './migrations/v2_custom_kategorien';
import { v3_gebetssitzungen } from './migrations/v3_gebetssitzungen';
import { v4_sitzungssteuerung } from './migrations/v4_sitzungssteuerung';

const LATEST_VERSION = 4;
let _db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  const db = await SQLite.openDatabaseAsync('gebet.db');

  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await v1_initial(db);
  }
  if (currentVersion < 2) {
    await v2_custom_kategorien(db);
  }
  if (currentVersion < 3) {
    await v3_gebetssitzungen(db);
  }
  if (currentVersion < 4) {
    await v4_sitzungssteuerung(db);
  }

  await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION}`);

  _db = db;
  return db;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error('Datenbank noch nicht geöffnet');
  return _db;
}
