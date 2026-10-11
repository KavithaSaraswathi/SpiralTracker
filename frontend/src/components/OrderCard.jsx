import React from 'react';
import { Link } from 'react-router-dom';
import PaymentBadge from './PaymentBadge';
import DeliveryBadge from './DeliveryBadge';

const OrderCard = ({ order, onStatusChange, onArchive, archiving = false }) => {
  const canArchive = order.paymentStatus === 'PAID' && order.deliveryStatus === 'RECEIVED';
  return (
    <div className="order-card">
      <Link to={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card-top">
          <div>
            <div className="person-name">{order.studentName}</div>
            <div className="order-meta">
              <strong style={{ color: '#2563eb' }}>{order.subjectName}</strong> • {order.quantity} {order.quantity === 1 ? 'copy' : 'copies'}
              {order.unitPrice != null ? ` @ ₹${Number(order.unitPrice).toFixed(2)} / copy` : ''}
              {order.pages ? ` (${order.pages} pgs)` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <PaymentBadge status={order.paymentStatus} />
            <DeliveryBadge status={order.deliveryStatus} />
          </div>
        </div>
      </Link>

      <div className="card-bottom">
        <div>
          <span className="price-tag">₹{Number(order.totalAmount).toFixed(0)}</span>
          {order.paymentStatus !== 'PAID' && (
            <span className="sub-price" style={{ marginLeft: '8px' }}>
              (Paid: ₹{Number(order.amountPaid).toFixed(0)} | Left: ₹{Number(order.remainingAmount).toFixed(0)})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {onArchive && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onArchive(order);
              }}
              disabled={!canArchive || archiving}
              title={canArchive
                ? 'Move this completed order to History'
                : 'An order must be fully paid and received before moving it to History.'}
              className="btn btn-sm btn-outline"
              style={{ padding: '4px 8px', fontSize: '0.7rem', minHeight: '32px', opacity: canArchive ? 1 : 0.55 }}
            >
              {archiving ? 'Moving...' : 'Move to History'}
            </button>
          )}
          {order.paymentStatus !== 'PAID' && (
            <Link to={`/orders/${order.id}`} className="btn btn-sm btn-success" style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '32px' }}>
              Record payment
            </Link>
          )}

          {onStatusChange && order.deliveryStatus !== 'RECEIVED' && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const nextStatus = order.deliveryStatus === 'ORDERED' ? 'READY' : 'RECEIVED';
                onStatusChange(order.id, nextStatus);
              }}
              className="btn btn-sm btn-outline"
              style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '32px' }}
            >
              {order.deliveryStatus === 'ORDERED' ? '→ Ready' : '→ Received'}
            </button>
          )}
        </div>
      </div>
      {onArchive && !canArchive && (
        <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
          Move to History is available after the order is fully paid and received.
        </div>
      )}
    </div>
  );
};

export default OrderCard;
