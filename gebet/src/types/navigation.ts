import { NavigatorScreenParams } from '@react-navigation/native';

export type AnliegenStackParamList = {
  AnliegenListe: undefined;
  AnliegenDetail: { anliegenId: string };
  AnliegenFormular: { anliegenId?: string };
};

export type JournalStackParamList = {
  JournalListe: undefined;
  JournalDetail: { eintragId: string };
  JournalFormular: { anliegenId?: string; eintragId?: string };
};

export type MainTabParamList = {
  Heute: undefined;
  Anliegen: NavigatorScreenParams<AnliegenStackParamList>;
  Journal: NavigatorScreenParams<JournalStackParamList>;
  Einstellungen: undefined;
};

export type RootStackParamList = {
  Laden: undefined;
  Haupt: NavigatorScreenParams<MainTabParamList>;
  Gebetssitzung: undefined;
};
