export type Kategorie = string;

export type Stimmung = 'frieden' | 'dankbar' | 'suchend' | 'traurig' | 'hoffnungsvoll';

export interface Anliegen {
  id: string;
  titel: string;
  beschreibung?: string;
  kategorie: Kategorie;
  erhoert: boolean;
  erhoertAm?: string;
  notizErhoert?: string;
  erstelltAm: string;
  geaendertAm: string;
  archiviert: boolean;
  inSitzung: boolean;
  zuletztGebetetAm?: string;
}

export interface JournalEintrag {
  id: string;
  titel?: string;
  inhalt: string;
  datum: string;
  stimmung?: Stimmung;
  anliegenId?: string;
  erstelltAm: string;
  geaendertAm: string;
}
