import { colors } from './colors';
import { CustomKategorie } from '../db/queries/kategorien';

export const KATEGORIEN: { value: string; label: string; farbe: string; icon: string }[] = [
  { value: 'allgemein', label: 'Allgemein', farbe: '#B0A090', icon: 'ellipse-outline' },
  { value: 'familie', label: 'Familie', farbe: colors.salbei, icon: 'people-outline' },
  { value: 'beruf', label: 'Beruf', farbe: '#7A8FAE', icon: 'briefcase-outline' },
  { value: 'gesundheit', label: 'Gesundheit', farbe: '#E07B7B', icon: 'heart-outline' },
  { value: 'freunde', label: 'Freunde', farbe: '#C4A55A', icon: 'person-add-outline' },
  { value: 'dankbarkeit', label: 'Dankbarkeit', farbe: colors.terrakotta, icon: 'sunny-outline' },
  { value: 'beichte', label: 'Beichte', farbe: '#9B7BB5', icon: 'shield-outline' },
  { value: 'welt', label: 'Welt', farbe: '#5A9EAE', icon: 'globe-outline' },
  { value: 'anderes', label: 'Anderes', farbe: '#A09080', icon: 'add-circle-outline' },
];

export function getKategorieInfo(
  kat: string,
  customKategorien?: CustomKategorie[]
): { value: string; label: string; farbe: string; icon: string } {
  const builtin = KATEGORIEN.find((k) => k.value === kat);
  if (builtin) return builtin;

  if (customKategorien) {
    const custom = customKategorien.find((k) => k.id === kat);
    if (custom) return { value: custom.id, label: custom.label, farbe: custom.farbe, icon: 'bookmark-outline' };
  }

  return { value: kat, label: kat, farbe: '#B0A090', icon: 'bookmark-outline' };
}
