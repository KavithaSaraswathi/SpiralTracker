import React from 'react';

const PaymentBadge = ({ status }) => {
  const normStatus = (status || '').toUpperCase();

  if (normStatus === 'PAID') {
    return (
      <span className="badge badge-paid">
        <span className="status-dot"></span>
        Paid
      </span>
    );
  } else if (normStatus === 'PARTIAL') {
    return (
      <span className="badge badge-partial">
        <span className="status-dot"></span>
        Partial
      </span>
    );
  } else {
    return (
      <span className="badge badge-pending">
        <span className="status-dot"></span>
        Pending
      </span>
    );
  }
};

export default PaymentBadge;
