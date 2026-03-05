import { subDays, format, parseISO, isToday, isYesterday } from 'date-fns';

export function heuteAlsISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function berechneAktuellenStreak(aktiveTage: string[]): number {
  if (aktiveTage.length === 0) return 0;

  const sorted = [...aktiveTage].sort();
  const letzterTag = sorted[sorted.length - 1];
  const letzterDatum = parseISO(letzterTag);

  if (!isToday(letzterDatum) && !isYesterday(letzterDatum)) return 0;

  let streak = 0;
  let referenz = letzterDatum;

  for (let i = sorted.length - 1; i >= 0; i--) {
    const tagDatum = parseISO(sorted[i]);
    const referenzStr = format(referenz, 'yyyy-MM-dd');

    if (sorted[i] === referenzStr) {
      streak++;
      referenz = subDays(referenz, 1);
    } else {
      break;
    }
  }

  return streak;
}

export function berechneLaengstenStreak(aktiveTage: string[]): number {
  if (aktiveTage.length === 0) return 0;

  const sorted = [...aktiveTage].sort();
  let maxStreak = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISO(sorted[i - 1]);
    const curr = parseISO(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 1;
    }
  }

  return maxStreak;
}

export function wochentageFuerAktuelleWoche(): { datum: string; aktiv: boolean }[] {
  const heute = new Date();
  const wochentag = heute.getDay(); // 0 = Sonntag
  const montag = subDays(heute, wochentag === 0 ? 6 : wochentag - 1);

  return Array.from({ length: 7 }, (_, i) => {
    const tag = subDays(montag, -i);
    return {
      datum: format(tag, 'yyyy-MM-dd'),
      aktiv: false,
    };
  });
}
