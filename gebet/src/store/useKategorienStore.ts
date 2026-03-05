import { create } from 'zustand';
import {
  CustomKategorie,
  alleCustomKategorienLaden,
  customKategorieHinzufuegen,
  customKategorieLoeschen,
} from '../db/queries/kategorien';
import uuid from 'react-native-uuid';

const FARBEN = [
  '#7A8FAE', '#E07B7B', '#C4A55A', '#9B7BB5',
  '#5A9EAE', '#6DAA8F', '#E09B5A', '#AE7A8F',
];

interface KategorienStore {
  kategorien: CustomKategorie[];
  ladeKategorien: () => Promise<void>;
  fuegeHinzu: (label: string) => Promise<void>;
  loesche: (id: string) => Promise<void>;
}

export const useKategorienStore = create<KategorienStore>((set, get) => ({
  kategorien: [],

  ladeKategorien: async () => {
    const kategorien = await alleCustomKategorienLaden();
    set({ kategorien });
  },

  fuegeHinzu: async (label) => {
    const id = uuid.v4() as string;
    const farbe = FARBEN[Math.floor(Math.random() * FARBEN.length)];
    await customKategorieHinzufuegen(id, label, farbe);
    await get().ladeKategorien();
  },

  loesche: async (id) => {
    await customKategorieLoeschen(id);
    set((state) => ({ kategorien: state.kategorien.filter((k) => k.id !== id) }));
  },
}));
