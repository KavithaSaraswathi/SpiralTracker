import React, { useEffect, useState } from 'react';
import { getOrders, updateDeliveryStatus } from '../api/api';
import OrderCard from '../components/OrderCard';
import Loading from '../components/Loading';
import { Truck } from 'lucide-react';

const DeliveryTracking = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      setError('Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeliveryChange = async (orderId, newStatus) => {
    try {
      await updateDeliveryStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      alert('Failed to update delivery status');
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.deliveryStatus.toUpperCase() === statusFilter;
  });

  const orderedCount = orders.filter((o) => o.deliveryStatus === 'ORDERED').length;
  const readyCount = orders.filter((o) => o.deliveryStatus === 'READY').length;
  const receivedCount = orders.filter((o) => o.deliveryStatus === 'RECEIVED').length;

  return (
    <div>
      <div className="section-header" style={{ marginTop: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Delivery Tracking</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Order → Ready → Received pipeline</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Pipeline Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => setStatusFilter('ORDERED')}
          className={`filter-btn ${statusFilter === 'ORDERED' ? 'active' : ''}`}
          style={{ textAlign: 'center', padding: '10px 4px', borderRadius: '10px' }}
        >
          <div style={{ fontSize: '0.68rem' }}>ORDERED</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{orderedCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('READY')}
          className={`filter-btn ${statusFilter === 'READY' ? 'active' : ''}`}
          style={{ textAlign: 'center', padding: '10px 4px', borderRadius: '10px' }}
        >
          <div style={{ fontSize: '0.68rem' }}>READY</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{readyCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('RECEIVED')}
          className={`filter-btn ${statusFilter === 'RECEIVED' ? 'active' : ''}`}
          style={{ textAlign: 'center', padding: '10px 4px', borderRadius: '10px' }}
        >
          <div style={{ fontSize: '0.68rem' }}>RECEIVED</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{receivedCount}</div>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          style={{ fontSize: '0.75rem', padding: '4px 12px' }}
        >
          Show All ({orders.length})
        </button>
      </div>

      {loading ? (
        <Loading message="Loading delivery status..." />
      ) : filtered.length > 0 ? (
        <div className="card-list">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleDeliveryChange}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state-icon">🚚</p>
          <p>No orders in this status.</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;
