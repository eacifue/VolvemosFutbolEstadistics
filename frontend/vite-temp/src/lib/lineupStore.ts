// Posiciones que se guardaban solo en este dispositivo antes de que el servidor las compartiera.
// Se leen una vez en el editor para poder subirlas; al guardar para todos se borran.
const KEY = 'vf_lineup_v2';
export type Spots = Record<number, { x: number; y: number }>;

const readAll = (): Record<string, Spots> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Spots>;
  } catch {
    return {};
  }
};

export const loadLocalSpots = (matchId: number): Spots => readAll()[String(matchId)] ?? {};

export const clearLocalSpots = (matchId: number): void => {
  try {
    const all = readAll();
    delete all[String(matchId)];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // sin almacenamiento
  }
};
