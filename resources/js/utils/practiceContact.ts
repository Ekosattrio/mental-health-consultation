import type {Workspace} from '../types/practice';

export function publicPracticeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  return /^\[[A-Z0-9_ -]+\]$/.test(text) ? '' : text;
}

export function practiceHours(calendar: Workspace['calendar']): string {
  if (!calendar) return '';
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const rows = calendar.weekly.filter(day => day.intervals.length > 0).map(day => `${days[day.day_of_week - 1]} ${day.intervals.map(([start, end]) => `${start}–${end}`).join(', ')}`);
  return rows.length ? `${rows.join('; ')} WIB` : 'Praktik sedang libur';
}

export function compactPracticeHours(value: string): string {
  const hours=publicPracticeText(value);
  const ranges=hours.split(/[;\n]/).flatMap(part=>{
    const times=[...part.matchAll(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g)].map(match=>`${match[1].padStart(2,'0')}:${match[2]}`);
    return times.length>=2?[`${times[0]} - ${times[times.length-1]}`]:[];
  });
  return ranges.length?`${[...new Set(ranges)].join(' / ')} WIB`:hours;
}
