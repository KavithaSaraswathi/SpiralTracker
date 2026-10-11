import React from 'react';

const DeliveryBadge = ({ status }) => {
  const norm = (status || 'ORDERED').toUpperCase();

  let label = 'Ordered';
  let badgeClass = 'badge-delivery-ordered';
  let dotColor = '#3b82f6';

  if (norm === 'READY') {
    label = 'Ready';
    badgeClass = 'badge-delivery-ready';
    dotColor = '#eab308';
  } else if (norm === 'RECEIVED') {
    label = 'Received';
    badgeClass = 'badge-delivery-received';
    dotColor = '#10b981';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="status-dot" style={{ backgroundColor: dotColor }}></span>
      {label}
    </span>
  );
};

export default DeliveryBadge;
