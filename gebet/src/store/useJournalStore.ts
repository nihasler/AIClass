import { create } from 'zustand';
import { JournalEintrag, Stimmung } from '../types/prayer';
import {
  alleEintraegeladen,
  eintragEinfuegen,
  eintragAktualisieren,
  eintragLoeschen,
} from '../db/queries/journal';
import uuid from 'react-native-uuid';
import { format } from 'date-fns';

interface JournalStore {
  eintraege: JournalEintrag[];
  isLoading: boolean;
  ladeEintraege: () => Promise<void>;
  fuegeHinzu: (data: Pick<JournalEintrag, 'inhalt' | 'titel' | 'stimmung' | 'anliegenId'>) => Promise<string>;
  aktualisiere: (id: string, data: Partial<JournalEintrag>) => Promise<void>;
  loesche: (id: string) => Promise<void>;
  eintraegeNachMonat: () => { monat: string; eintraege: JournalEintrag[] }[];
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  eintraege: [],
  isLoading: false,

  ladeEintraege: async () => {
    set({ isLoading: true });
    const eintraege = await alleEintraegeladen();
    set({ eintraege, isLoading: false });
  },

  fuegeHinzu: async (data) => {
    const id = uuid.v4() as string;
    const neu: Omit<JournalEintrag, 'erstelltAm' | 'geaendertAm'> = {
      id,
      titel: data.titel,
      inhalt: data.inhalt,
      datum: format(new Date(), 'yyyy-MM-dd'),
      stimmung: data.stimmung,
      anliegenId: data.anliegenId,
    };
    await eintragEinfuegen(neu);
    await get().ladeEintraege();
    return id;
  },

  aktualisiere: async (id, data) => {
    await eintragAktualisieren(id, data);
    await get().ladeEintraege();
  },

  loesche: async (id) => {
    await eintragLoeschen(id);
    await get().ladeEintraege();
  },

  eintraegeNachMonat: () => {
    const { eintraege } = get();
    const map = new Map<string, JournalEintrag[]>();

    for (const e of eintraege) {
      const monat = e.datum.substring(0, 7); // YYYY-MM
      if (!map.has(monat)) map.set(monat, []);
      map.get(monat)!.push(e);
    }

    return Array.from(map.entries()).map(([monat, eintraege]) => ({
      monat,
      eintraege,
    }));
  },
}));
