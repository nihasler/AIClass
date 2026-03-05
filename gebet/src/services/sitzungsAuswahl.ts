import { Anliegen } from '../types/prayer';

export function waehleSitzungsAnliegen(
  anliegen: Anliegen[],
  anzahlTotal: number,   // 0 = alle
  proKategorie: number   // 0 = kein Limit
): Anliegen[] {
  // 1. Filter: nur aktive, nicht pausierte Anliegen
  const kandidaten = anliegen.filter(
    (a) => !a.erhoert && !a.archiviert && a.inSitzung
  );

  // 2. Rotation: noch nie gebetete zuerst, dann nach Datum aufsteigend
  const sortiert = [...kandidaten].sort((a, b) => {
    if (!a.zuletztGebetetAm && !b.zuletztGebetetAm) return 0;
    if (!a.zuletztGebetetAm) return -1;
    if (!b.zuletztGebetetAm) return 1;
    return a.zuletztGebetetAm.localeCompare(b.zuletztGebetetAm);
  });

  // 3. Pro-Kategorie-Limit anwenden
  let gefiltert: Anliegen[];
  if (proKategorie > 0) {
    const zählerProKategorie = new Map<string, number>();
    gefiltert = sortiert.filter((a) => {
      const aktuell = zählerProKategorie.get(a.kategorie) ?? 0;
      if (aktuell < proKategorie) {
        zählerProKategorie.set(a.kategorie, aktuell + 1);
        return true;
      }
      return false;
    });
  } else {
    gefiltert = sortiert;
  }

  // 4. Gesamt-Limit anwenden
  if (anzahlTotal > 0) {
    return gefiltert.slice(0, anzahlTotal);
  }
  return gefiltert;
}
