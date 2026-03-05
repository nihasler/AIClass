import { create } from 'zustand';
import { Anliegen, Kategorie } from '../types/prayer';
import {
  alleAnliegenLaden,
  anliegenEinfuegen,
  anliegenAktualisieren,
  anliegenAlsErhoertMarkieren,
  anliegenArchivieren,
  anliegenGebetetAktualisieren,
} from '../db/queries/anliegen';
import uuid from 'react-native-uuid';

type Filter = 'alle' | 'offen' | 'erhoert' | 'archiviert' | Kategorie;

interface AnliegenStore {
  anliegen: Anliegen[];
  isLoading: boolean;
  aktiverFilter: Filter;
  ladeAnliegen: () => Promise<void>;
  fuegeHinzu: (data: Pick<Anliegen, 'titel' | 'beschreibung' | 'kategorie'>) => Promise<void>;
  aktualisiere: (id: string, data: Partial<Anliegen>) => Promise<void>;
  markiereAlsErhoert: (id: string, notiz?: string) => Promise<void>;
  archiviere: (id: string) => Promise<void>;
  sitzungGebetet: (ids: string[]) => Promise<void>;
  setzeFilter: (filter: Filter) => void;
  gefilterteAnliegen: () => Anliegen[];
}

export const useAnliegenStore = create<AnliegenStore>((set, get) => ({
  anliegen: [],
  isLoading: false,
  aktiverFilter: 'offen',

  ladeAnliegen: async () => {
    set({ isLoading: true });
    const anliegen = await alleAnliegenLaden();
    set({ anliegen, isLoading: false });
  },

  fuegeHinzu: async (data) => {
    const neu: Omit<Anliegen, 'erstelltAm' | 'geaendertAm'> = {
      id: uuid.v4() as string,
      titel: data.titel,
      beschreibung: data.beschreibung,
      kategorie: data.kategorie,
      erhoert: false,
      archiviert: false,
      inSitzung: true,
    };
    await anliegenEinfuegen(neu);
    await get().ladeAnliegen();
  },

  aktualisiere: async (id, data) => {
    await anliegenAktualisieren(id, data);
    await get().ladeAnliegen();
  },

  markiereAlsErhoert: async (id, notiz) => {
    await anliegenAlsErhoertMarkieren(id, notiz);
    await get().ladeAnliegen();
  },

  archiviere: async (id) => {
    await anliegenArchivieren(id);
    await get().ladeAnliegen();
  },

  sitzungGebetet: async (ids) => {
    await anliegenGebetetAktualisieren(ids);
    await get().ladeAnliegen();
  },

  setzeFilter: (filter) => set({ aktiverFilter: filter }),

  gefilterteAnliegen: () => {
    const { anliegen, aktiverFilter } = get();
    switch (aktiverFilter) {
      case 'alle':
        return anliegen.filter((a) => !a.archiviert);
      case 'offen':
        return anliegen.filter((a) => !a.erhoert && !a.archiviert);
      case 'erhoert':
        return anliegen.filter((a) => a.erhoert && !a.archiviert);
      case 'archiviert':
        return anliegen.filter((a) => a.archiviert);
      default:
        return anliegen.filter((a) => a.kategorie === aktiverFilter && !a.archiviert);
    }
  },
}));
