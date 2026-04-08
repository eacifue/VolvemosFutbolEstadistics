import React, { useState } from 'react';
import Notification, { type NotificationType } from './Notification';
import './NotificationDemo.css';

const NotificationDemo: React.FC = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    type: NotificationType;
    message: string;
  }>>([]);

  const showNotification = (type: NotificationType, message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notification-demo">
      <h1>Notification Component Demo</h1>

      <div className="demo-controls">
        <button
          className="demo-btn demo-btn--success"
          onClick={() => showNotification('success', 'Operación completada exitosamente')}
        >
          Success
        </button>

        <button
          className="demo-btn demo-btn--error"
          onClick={() => showNotification('error', 'Ha ocurrido un error inesperado')}
        >
          Error
        </button>

        <button
          className="demo-btn demo-btn--warning"
          onClick={() => showNotification('warning', 'Revisa los datos antes de continuar')}
        >
          Warning
        </button>

        <button
          className="demo-btn demo-btn--info"
          onClick={() => showNotification('info', 'Nueva actualización disponible')}
        >
          Info
        </button>
      </div>

      <div className="notifications-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
            position="top-right"
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationDemo;