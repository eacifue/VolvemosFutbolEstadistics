import { useCallback, useState } from 'react';

export type Theme = 'dark' | 'light';
const KEY = 'vf_theme';

const current = (): Theme => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

export const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useState<Theme>(current);
  const toggle = useCallback(() => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Sin almacenamiento: el tema vuelve a oscuro al recargar.
    }
    setTheme(next);
  }, []);
  return [theme, toggle];
};
