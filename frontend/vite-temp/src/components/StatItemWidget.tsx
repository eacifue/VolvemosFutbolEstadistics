import React from 'react';

type StatItemWidgetProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
};

const StatItemWidget: React.FC<StatItemWidgetProps> = ({ label, value, icon }) => {
  return (
    <div className="stat-item-widget" role="group" aria-label={`${label}: ${value}`}>
      <span className="stat-item-icon" aria-hidden="true">{icon}</span>
      <strong className="stat-item-value">{value}</strong>
      <span className="stat-item-label">{label}</span>
    </div>
  );
};

export default StatItemWidget;
