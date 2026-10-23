import { useEffect, useState } from 'react';

// PWA: guardamos el evento beforeinstallprompt para ofrecer "Instala la app" cuando el navegador lo permite.
interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
const DISMISS_KEY = 'vf_install_dismissed';

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

const dismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

export const useInstallPrompt = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    available: deferred != null && !dismissed(),
    install: async () => {
      if (!deferred) return false;
      await deferred.prompt();
      const choice = await deferred.userChoice;
      deferred = null;
      listeners.forEach((l) => l());
      return choice.outcome === 'accepted';
    },
    dismiss: () => {
      try {
        localStorage.setItem(DISMISS_KEY, '1');
      } catch {
        // sin almacenamiento
      }
      listeners.forEach((l) => l());
    },
  };
};
