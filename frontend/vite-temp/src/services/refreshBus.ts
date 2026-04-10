export const STATS_REFRESH_EVENT = 'stats:refresh';

export const emitStatsRefresh = (): void => {
  window.dispatchEvent(new CustomEvent(STATS_REFRESH_EVENT));
};

export const subscribeStatsRefresh = (handler: () => void): (() => void) => {
  const listener = () => handler();
  window.addEventListener(STATS_REFRESH_EVENT, listener as EventListener);

  return () => {
    window.removeEventListener(STATS_REFRESH_EVENT, listener as EventListener);
  };
};
