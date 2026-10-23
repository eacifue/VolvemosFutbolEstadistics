import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../data/context';
import { cx } from '../lib/cx';
import { AppHeader, BottomNav, DesktopSide } from './vaf/layout';
import { OfflineBar } from './vaf/states';

// header/nav: las pantallas principales los muestran; los detalles usan TopBar (como en el diseño).
export const Shell: React.FC<{ children: React.ReactNode; header?: boolean; nav?: boolean }> = ({ children, header = true, nav = true }) => {
  const { isAdmin } = useAuth();
  const { record, offline, savedAt } = useAppData();
  return (
    <div className={cx('vf-shell', !nav && 'vf-shell--bare')}>
      <DesktopSide admin={isAdmin} />
      {header ? <AppHeader record={record} admin={isAdmin} /> : null}
      <div className="vf-shell__content">
        {offline ? <div className="vf-shell__notice"><OfflineBar savedAt={savedAt} /></div> : null}
        {children}
      </div>
      {nav ? <BottomNav admin={isAdmin} /> : null}
    </div>
  );
};
