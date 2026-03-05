import { create } from 'zustand';
import { alleGebetstage, gebetstageAufzeichnen } from '../db/queries/streak';
import { alleSitzungenLaden, sitzungSpeichern, Sitzung } from '../db/queries/sitzungen';
import {
  berechneAktuellenStreak,
  berechneLaengstenStreak,
  heuteAlsISO,
} from '../services/streakService';
import uuid from 'react-native-uuid';

interface StreakStore {
  aktuellerStreak: number;
  laengsterStreak: number;
  aktiveTage: string[];
  heuteAktiv: boolean;
  sitzungen: Sitzung[];
  ladeStreak: () => Promise<void>;
  zeichneGebetstagAuf: () => Promise<void>;
  ladeSitzungen: () => Promise<void>;
  speichereSitzung: (dauerSek: number) => Promise<void>;
}

export const useStreakStore = create<StreakStore>((set, get) => ({
  aktuellerStreak: 0,
  laengsterStreak: 0,
  aktiveTage: [],
  heuteAktiv: false,
  sitzungen: [],

  ladeStreak: async () => {
    const tage = await alleGebetstage();
    const heute = heuteAlsISO();
    set({
      aktiveTage: tage,
      aktuellerStreak: berechneAktuellenStreak(tage),
      laengsterStreak: berechneLaengstenStreak(tage),
      heuteAktiv: tage.includes(heute),
    });
  },

  zeichneGebetstagAuf: async () => {
    const heute = heuteAlsISO();
    await gebetstageAufzeichnen(heute);
    await get().ladeStreak();
  },

  ladeSitzungen: async () => {
    const sitzungen = await alleSitzungenLaden();
    set({ sitzungen });
  },

  speichereSitzung: async (dauerSek: number) => {
    const id = uuid.v4() as string;
    const datum = heuteAlsISO();
    await sitzungSpeichern(id, datum, dauerSek);
    await get().ladeSitzungen();
  },
}));
