import React from 'react';

type StatItemWidgetProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
};

const StatItemWidget: React.FC<StatItemWidgetProps> = ({ label, value, icon, className = '' }) => {
  return (
    <div className={`stat-item-widget ${className}`.trim()} role="group" aria-label={`${label}: ${value}`}>
      <span className="stat-item-icon" aria-hidden="true">{icon}</span>
      <strong className="stat-item-value">{value}</strong>
      <span className="stat-item-label">{label}</span>
    </div>
  );
};

export default StatItemWidget;
