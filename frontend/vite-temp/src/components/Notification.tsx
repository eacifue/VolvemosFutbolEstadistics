import React, { useEffect, useState } from 'react';
import './Notification.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationAction {
  label: string;
  onClick: () => void;
}

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
  duration?: number; // in milliseconds, 0 means no auto-close
  showCloseButton?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  action?: NotificationAction;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose,
  duration,
  showCloseButton = true,
  position = 'top-right',
  action
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Smart duration based on type
  const smartDuration = duration !== undefined 
    ? duration 
    : type === 'error' ? 6000 : type === 'success' ? 3500 : 4000;

  useEffect(() => {
    if (smartDuration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, 300);
      }, smartDuration);
      return () => clearTimeout(timer);
    }
  }, [smartDuration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    const icons: Record<NotificationType, string> = {
      success: '✓',
      error: '!',
      warning: '⚠',
      info: 'i'
    };
    return icons[type];
  };

  const getTitle = () => {
    const titles: Record<NotificationType, string> = {
      success: '¡Éxito!',
      error: 'Oops',
      warning: 'Atención',
      info: 'Info'
    };
    return titles[type];
  };

  const handleAction = () => {
    action?.onClick();
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`notification notification--${type} notification--${position} ${isExiting ? 'notification--exiting' : ''}`}>
      <div className={`notification__icon notification__icon--${type}`}>
        {getIcon()}
      </div>
      <div className="notification__content">
        <div className="notification__header">
          <div className="notification__title">{getTitle()}</div>
          {showCloseButton && (
            <button 
              className="notification__close" 
              onClick={handleClose} 
              aria-label="Cerrar"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
        <div className="notification__message">{message}</div>
        {action && (
          <button 
            className="notification__action" 
            onClick={handleAction}
            type="button"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;