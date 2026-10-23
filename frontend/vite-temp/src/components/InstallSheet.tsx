import React, { useState } from 'react';
import { useInstallPrompt } from '../lib/install';
import { useToast } from '../lib/toast';
import { BottomSheet, Button, Crest, InsightRow, Pronto } from './vaf';

// P3 · Instalar la app (PWA real) + avisos push (Pronto: necesitan suscripciones en el servidor).
export const InstallSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { install, dismiss } = useInstallPrompt();
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <BottomSheet title="Instala la app" onClose={onClose}>
      <div className="vf-block vf-center">
        <span className="vf-push__icon vf-installicon"><Crest size={42} /></span>
        <p className="vf-body">Ten el marcador a un toque, sin buscar el link en el chat. Queda en tu pantalla de inicio y abre aunque no tengas señal.</p>
        <div className="vf-row vf-row--between vf-fullw">
          <span className="vf-overline">Avisos</span>
          <Pronto title="Los avisos push necesitan suscripciones en el servidor" />
        </div>
        <ul className="vf-insights vf-installlist">
          <InsightRow kind="fire" title="Resultado publicado" text="Apenas el admin cierre el partido." />
          <InsightRow kind="duo" title="Vota al MVP" text="Un recordatorio antes de que cierre." />
        </ul>
        <Button variant="primary" size="lg" block icon="plus" loading={busy ? 'Instalando…' : false}
          onClick={async () => {
            setBusy(true);
            const ok = await install();
            setBusy(false);
            if (ok) toast({ tone: 'success', message: 'App instalada', detail: 'Búscala en tu pantalla de inicio.' });
            onClose();
          }}>
          Agregar a inicio
        </Button>
        <Button variant="ghost" block onClick={() => { dismiss(); onClose(); }}>Ahora no</Button>
      </div>
    </BottomSheet>
  );
};
