import React, { useEffect, useState } from 'react';
import { getPendingOrders } from '../api/api';
import OrderCard from '../components/OrderCard';
import Loading from '../components/Loading';
import { Search } from 'lucide-react';

const PendingPayments = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPendingOrders();
      setOrders(response.data);
    } catch (err) {
      setError('Unable to load pending payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const filteredOrders = orders.filter((o) =>
    o.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = filteredOrders.reduce((sum, order) => {
    return sum + Number(order.remainingAmount || 0);
  }, 0);

  return (
    <div>
      <div className="section-header" style={{ marginTop: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pending Payments</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Outstanding balance collection</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Total Outstanding Banner */}
      <div
        style={{
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase' }}>
            Total Outstanding
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#dc2626' }}>
            ₹{totalOutstanding.toFixed(0)}
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#7f1d1d', fontWeight: 600 }}>
          {filteredOrders.length} {filteredOrders.length === 1 ? 'Record' : 'Records'}
        </div>
      </div>

      {/* Filter by Student or Subject */}
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Filter by student or subject name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading message="Loading pending payments..." />
      ) : filteredOrders.length > 0 ? (
        <div className="card-list">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state-icon">🎉</p>
          <p style={{ fontWeight: 700, color: '#16a34a' }}>No pending balances!</p>
          <p style={{ fontSize: '0.85rem' }}>All classmate payments are settled.</p>
        </div>
      )}
    </div>
  );
};

export default PendingPayments;
