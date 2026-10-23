import React, { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import { cx } from '../../lib/cx';
import { resultText } from '../../lib/format';
import type { PlayerStats, Side } from '../../lib/stats';
import { useToast } from '../../lib/toast';
import { Button, Crest, Tabs } from './base';
import { BottomSheet } from './overlays';
import { PlayerCard } from './player';

export type ShareData =
  | { variant: 'result'; date: string; white: number; black: number; sw: string[]; sb: string[]; overline?: string }
  | { variant: 'player'; date: string; stats: PlayerStats }
  | { variant: 'ranking'; date: string; overline: string; unit: string; rows: { name: string; team: Side | null; value: string | number }[] };

export const ShareCard = React.forwardRef<HTMLDivElement, { data: ShareData; ratio?: '9:16' | '1:1' }>(({ data: d, ratio = '9:16' }, ref) => (
  <div ref={ref} className={cx('vf-share', `vf-share--${d.variant}`, ratio === '1:1' ? 'is-square' : 'is-story')} data-theme="dark">
    <div className="vf-share__chalk" aria-hidden="true" />
    <div className="vf-share__top"><Crest size={28} /><span className="vf-share__brand">Volvemos al Fútbol<small>Blanco y Negro</small></span><span className="vf-share__date">{d.date}</span></div>
    {d.variant === 'result' ? (
      <div className="vf-share__main">
        <span className="vf-overline">{d.overline || 'Resultado final'}</span>
        <div className="vf-share__score">
          <span className="vf-swatch vf-swatch--white vf-swatch--lg" aria-hidden="true" />
          <span className="vf-num">{d.white}</span><span className="vf-share__dash">–</span><span className="vf-num">{d.black}</span>
          <span className="vf-swatch vf-swatch--black vf-swatch--lg" aria-hidden="true" />
        </div>
        <div className="vf-share__result">{resultText(d.white, d.black)}</div>
        <div className="vf-share__scorers"><ul>{d.sw.map((s, i) => <li key={i}>{s}</li>)}</ul><ul className="is-right">{d.sb.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
      </div>
    ) : d.variant === 'player' ? (
      <div className="vf-share__main"><PlayerCard variant="full" stats={d.stats} /></div>
    ) : (
      <div className="vf-share__main">
        <span className="vf-overline">{d.overline}</span>
        <ol className="vf-share__rank">
          {d.rows.map((r, i) => (
            <li key={i} className={i === 0 ? 'is-first' : ''}>
              <span className="vf-num">{i + 1}</span>
              {r.team ? <span className={cx('vf-swatch', `vf-swatch--${r.team}`, 'vf-swatch--xs')} aria-hidden="true" /> : null}
              <span className="vf-share__rname">{r.name}</span>
              <b className="vf-num">{r.value}</b>
            </li>
          ))}
        </ol>
      </div>
    )}
    <div className="vf-share__foot">volvemosalfutbol.app</div>
  </div>
));
ShareCard.displayName = 'ShareCard';

// Hoja "Compartir": vista previa 9:16 / 1:1, exporta PNG y usa Web Share si el teléfono lo permite.
export const ShareSheet: React.FC<{ title?: string; data: ShareData; fileName: string; onClose: () => void }> = ({ title = 'Compartir', data, fileName, onClose }) => {
  const [ratio, setRatio] = useState<'9:16' | '1:1'>('9:16');
  const [busy, setBusy] = useState<'share' | 'download' | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const render = async () => {
    if (!card.current) throw new Error('sin tarjeta');
    const blob = await toBlob(card.current, { pixelRatio: 3, cacheBust: true });
    if (!blob) throw new Error('sin imagen');
    return new File([blob], `${fileName}-${ratio === '1:1' ? 'cuadrado' : 'historia'}.png`, { type: 'image/png' });
  };

  const download = async (file?: File) => {
    const f = file ?? (await render());
    const url = URL.createObjectURL(f);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const onShare = async () => {
    setBusy('share');
    try {
      const file = await render();
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Volvemos al Fútbol' });
      } else {
        await download(file);
        toast({ tone: 'info', message: 'Imagen descargada', detail: 'Tu navegador no comparte directo: súbela al chat del grupo.' });
      }
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') {
        console.error(err);
        toast({ tone: 'error', message: 'No pudimos crear la imagen', detail: 'Vuelve a intentarlo en unos segundos.' });
      }
    } finally {
      setBusy(null);
    }
  };

  const onDownload = async () => {
    setBusy('download');
    try {
      await download();
      toast({ tone: 'success', message: 'Imagen descargada' });
    } catch (err) {
      console.error(err);
      toast({ tone: 'error', message: 'No pudimos crear la imagen', detail: 'Vuelve a intentarlo en unos segundos.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <BottomSheet title={title} onClose={onClose}>
      <div className="vf-block">
        <Tabs variant="segmented" label="Formato" active={ratio} onChange={(id) => setRatio(id as '9:16' | '1:1')} items={[{ id: '9:16', label: 'Historia 9:16' }, { id: '1:1', label: 'Cuadrado 1:1' }]} />
        <div className="vf-sharepreview"><ShareCard ref={card} data={data} ratio={ratio} /></div>
        <Button variant="primary" size="lg" block icon="share" loading={busy === 'share' ? 'Preparando…' : false} onClick={onShare}>Compartir imagen</Button>
        <Button variant="secondary" block icon="download" loading={busy === 'download' ? 'Preparando…' : false} onClick={onDownload}>Descargar PNG</Button>
      </div>
    </BottomSheet>
  );
};
