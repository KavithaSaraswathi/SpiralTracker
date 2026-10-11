import React from 'react';

const StatCard = ({ title, value, type = 'default' }) => {
  let customClass = '';
  if (type === 'collected') customClass = 'money-collected';
  if (type === 'pending') customClass = 'money-pending';

  return (
    <div className={`stat-card ${customClass}`}>
      <span className="stat-label">{title}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
};

export default StatCard;
