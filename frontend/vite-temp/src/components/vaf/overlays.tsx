import React, { useId } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';
import { useFocusTrap } from '../../lib/useFocusTrap';
import { Button, IconButton } from './base';
import { Icon } from './Icon';

export const BottomSheet: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({ title, children, onClose }) => {
  const id = useId();
  const ref = useFocusTrap<HTMLDivElement>(onClose);
  return createPortal(
    <div className="vf-sheet-layer">
      <div className="vf-scrim" aria-hidden="true" onClick={onClose} />
      <div ref={ref} className="vf-sheet" role="dialog" aria-modal="true" aria-labelledby={id} tabIndex={-1}>
        <span className="vf-sheet__grab" aria-hidden="true" />
        <div className="vf-sheet__head"><h2 id={id} className="vf-sheet__title">{title}</h2><IconButton icon="close" label="Cerrar" onClick={onClose} /></div>
        <div className="vf-sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export const ConfirmDialog: React.FC<{ title: string; body: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean; loading?: boolean; loadingLabel?: string; onConfirm: () => void; onCancel: () => void }> = ({ title, body, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger, loading, loadingLabel = 'Borrando…', onConfirm, onCancel }) => {
  const id = useId();
  const ref = useFocusTrap<HTMLDivElement>(loading ? undefined : onCancel);
  return createPortal(
    <div className="vf-dialog-layer">
      <div className="vf-scrim" aria-hidden="true" onClick={loading ? undefined : onCancel} />
      <div ref={ref} className="vf-dialog" role="alertdialog" aria-modal="true" aria-labelledby={id} aria-describedby={`${id}d`} tabIndex={-1}>
        <h2 id={id} className="vf-dialog__title">{title}</h2>
        <p id={`${id}d`} className="vf-dialog__body">{body}</p>
        <div className="vf-dialog__actions">
          <Button variant="ghost" onClick={onCancel} disabled={loading} data-autofocus>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading ? loadingLabel : false} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export type ToastTone = 'success' | 'error' | 'info';
export const Toast: React.FC<{ tone?: ToastTone; message: string; detail?: string; onClose?: () => void }> = ({ tone = 'success', message, detail, onClose }) => (
  <div className={cx('vf-toast', `is-${tone}`)} role={tone === 'error' ? 'alert' : 'status'} onClick={onClose}>
    <span className="vf-toast__icon"><Icon name={tone === 'success' ? 'check' : tone === 'error' ? 'close' : 'info'} size={16} /></span>
    <span><b>{message}</b>{detail ? <span className="vf-toast__detail">{detail}</span> : null}</span>
  </div>
);
