// Formato es-CO: fechas, nombres y posiciones tal como los usa el libro de marca.
import type { Player } from '../types';

export type PosShort = 'POR' | 'DEF' | 'MED' | 'DEL';

const POS_SHORT: Record<string, PosShort> = {
  Portero: 'POR',
  Defensa: 'DEF',
  Mediocampista: 'MED',
  Delantero: 'DEL',
};

export const POS_LABEL: Record<PosShort, string> = {
  POR: 'Portero',
  DEF: 'Defensa',
  MED: 'Mediocampista',
  DEL: 'Delantero',
};

export const posShortOf = (name?: string | null): PosShort => (name && POS_SHORT[name.trim()]) || 'MED';

const clean = (value?: string | null): string => (value ?? '').replace(/\s+/g, ' ').trim();

export const fullName = (p: Pick<Player, 'firstName' | 'lastName'>): string =>
  clean(`${clean(p.firstName)} ${clean(p.lastName)}`) || 'Jugador';

export const initialsOf = (p: Pick<Player, 'firstName' | 'lastName'>): string => {
  const first = clean(p.firstName)[0] ?? '';
  const last = clean(p.lastName)[0] ?? '';
  return `${first}${last}`.toUpperCase() || '?';
};

// "Germán Piña" → "G. Piña"; "Juan David Piña" → "J.D. Piña"
export const shortName = (p: Pick<Player, 'firstName' | 'lastName'>): string => {
  const firsts = clean(p.firstName).split(' ').filter(Boolean);
  const last = clean(p.lastName).split(' ').filter(Boolean)[0] ?? '';
  if (!firsts.length) return last || 'Jugador';
  if (!last) return firsts.join(' ');
  return `${firsts.map((w) => `${w[0].toUpperCase()}.`).join('')} ${last}`;
};

export const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const DAY = 24 * 60 * 60 * 1000;

export const toDate = (iso: string): Date => new Date(iso);

const startOfDay = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const isSameDay = (a: Date, b: Date): boolean => startOfDay(a) === startOfDay(b);

// "jue 15 oct"
export const shortDate = (d: Date): string =>
  d
    .toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '')
    .replace(',', '')
    .replace(/ de /g, ' ');

// "jue 15 oct 2026"
export const shortDateYear = (d: Date): string => `${shortDate(d)} ${d.getFullYear()}`;

export const time24 = (d: Date): string =>
  d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });

export const dateTime = (d: Date): string => `${shortDate(d)} · ${time24(d)}`;

export const longDate = (d: Date): string =>
  d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

export const monthTitle = (d: Date): string => {
  const m = d.toLocaleDateString('es-CO', { month: 'long' });
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${d.getFullYear()}`;
};

// "hoy", "ayer", "hace 6 días", "hace 2 semanas", "en 3 días"
export const relativeDay = (d: Date, now = new Date()): string => {
  const diff = Math.round((startOfDay(now) - startOfDay(d)) / DAY);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'ayer';
  if (diff === -1) return 'mañana';
  if (diff < 0) return `en ${-diff} días`;
  if (diff < 14) return `hace ${diff} días`;
  if (diff < 60) return `hace ${Math.round(diff / 7)} semanas`;
  const months = Math.round(diff / 30);
  return months <= 1 ? 'hace un mes' : `hace ${months} meses`;
};

// Temporadas semestrales: 2026-I (ene–jun) y 2026-II (jul–dic).
export const seasonOf = (d: Date): string => `${d.getFullYear()}-${d.getMonth() < 6 ? 'I' : 'II'}`;

export const toLocalInputDate = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const toLocalInputTime = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const money = (value: number): string =>
  `$${Math.round(value).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

// "20:00 · Cancha La Paz, Envigado" (sin cancha, solo la hora)
export const timeAndVenue = (d: Date, venue?: string | null): string => (venue ? `${time24(d)} · ${venue}` : time24(d));

export const resultText = (w: number, b: number): string => (w > b ? 'Ganó Blanco' : b > w ? 'Ganó Negro' : 'Empate');

export const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;
