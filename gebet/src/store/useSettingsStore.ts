import { create } from 'zustand';
import { alleEinstellungen, einstellungSpeichern } from '../db/queries/streak';
import { erinnerungPlanen, erinnerungAbbrechen } from '../services/notificationService';

interface SettingsStore {
  erinnerungAktiv: boolean;
  erinnerungStunde: number;
  erinnerungMinute: number;
  haptikAktiv: boolean;
  anzahlProSitzung: number;    // 0 = alle
  anzahlProKategorie: number;  // 0 = kein Limit
  ladeEinstellungen: () => Promise<void>;
  speichereErinnerung: (aktiv: boolean, stunde: number, minute: number) => Promise<void>;
  speichereHaptik: (aktiv: boolean) => Promise<void>;
  speichereSitzungsKonfiguration: (anzahl: number, proKategorie: number) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  erinnerungAktiv: true,
  erinnerungStunde: 20,
  erinnerungMinute: 0,
  haptikAktiv: true,
  anzahlProSitzung: 0,
  anzahlProKategorie: 0,

  ladeEinstellungen: async () => {
    const einstellungen = await alleEinstellungen();
    set({
      erinnerungAktiv: einstellungen['erinnerung_aktiv'] === '1',
      erinnerungStunde: parseInt(einstellungen['erinnerung_stunde'] ?? '20', 10),
      erinnerungMinute: parseInt(einstellungen['erinnerung_minute'] ?? '0', 10),
      haptikAktiv: einstellungen['haptik_aktiv'] === '1',
      anzahlProSitzung: parseInt(einstellungen['sitzung_anzahl'] ?? '0', 10),
      anzahlProKategorie: parseInt(einstellungen['sitzung_pro_kategorie'] ?? '0', 10),
    });
  },

  speichereErinnerung: async (aktiv, stunde, minute) => {
    await einstellungSpeichern('erinnerung_aktiv', aktiv ? '1' : '0');
    await einstellungSpeichern('erinnerung_stunde', String(stunde));
    await einstellungSpeichern('erinnerung_minute', String(minute));
    set({ erinnerungAktiv: aktiv, erinnerungStunde: stunde, erinnerungMinute: minute });

    if (aktiv) {
      await erinnerungPlanen(stunde, minute);
    } else {
      await erinnerungAbbrechen();
    }
  },

  speichereHaptik: async (aktiv) => {
    await einstellungSpeichern('haptik_aktiv', aktiv ? '1' : '0');
    set({ haptikAktiv: aktiv });
  },

  speichereSitzungsKonfiguration: async (anzahl, proKategorie) => {
    await einstellungSpeichern('sitzung_anzahl', String(anzahl));
    await einstellungSpeichern('sitzung_pro_kategorie', String(proKategorie));
    set({ anzahlProSitzung: anzahl, anzahlProKategorie: proKategorie });
  },
}));
