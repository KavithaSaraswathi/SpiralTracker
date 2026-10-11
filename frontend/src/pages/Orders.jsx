import React, { useEffect, useState } from 'react';
import { getOrders, searchOrders, updateDeliveryStatus, archiveOrder } from '../api/api';
import OrderCard from '../components/OrderCard';
import Loading from '../components/Loading';
import { Search } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [deliveryFilter, setDeliveryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [archivingId, setArchivingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      let res;
      if (searchQuery.trim()) {
        res = await searchOrders(searchQuery.trim());
      } else {
        res = await getOrders();
      }
      setOrders(res.data);
    } catch (err) {
      setError('Unable to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDeliveryChange = async (orderId, newStatus) => {
    try {
      await updateDeliveryStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      alert('Failed to update delivery');
    }
  };

  const handleArchive = async (order) => {
    if (order.paymentStatus !== 'PAID' || order.deliveryStatus !== 'RECEIVED') {
      setError('Only fully paid and received orders can be moved to History.');
      return;
    }
    if (!window.confirm('This order is fully paid and received. Move it to History?')) return;
    try {
      setArchivingId(order.id);
      setError('');
      setSuccess('');
      await archiveOrder(order.id);
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setSuccess(`Order #${order.id} moved to History.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to move order to History.');
    } finally {
      setArchivingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (paymentFilter !== 'ALL' && o.paymentStatus.toUpperCase() !== paymentFilter) return false;
    if (deliveryFilter !== 'ALL' && o.deliveryStatus.toUpperCase() !== deliveryFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="section-header" style={{ marginTop: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Active Orders</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Open orders; completed orders are stored in History</p>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{filteredOrders.length} records</span>
      </div>

      {/* Search Input */}
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by student or subject name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Payment Filter Bar */}
      <div style={{ marginBottom: '6px' }}>
        <div className="filter-bar">
          <span style={{ fontSize: '0.72rem', alignSelf: 'center', color: '#64748b', fontWeight: 700, paddingRight: '4px' }}>
            PAY:
          </span>
          {['ALL', 'PENDING', 'PARTIAL', 'PAID'].map((p) => (
            <button
              key={p}
              onClick={() => setPaymentFilter(p)}
              className={`filter-btn ${paymentFilter === p ? 'active' : ''}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Filter Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div className="filter-bar">
          <span style={{ fontSize: '0.72rem', alignSelf: 'center', color: '#64748b', fontWeight: 700, paddingRight: '4px' }}>
            DLV:
          </span>
          {['ALL', 'ORDERED', 'READY', 'RECEIVED'].map((d) => (
            <button
              key={d}
              onClick={() => setDeliveryFilter(d)}
              className={`filter-btn ${deliveryFilter === d ? 'active' : ''}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <Loading message="Loading orders..." />
      ) : filteredOrders.length > 0 ? (
        <div className="card-list">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleDeliveryChange}
              onArchive={handleArchive}
              archiving={archivingId === order.id}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state-icon">📋</p>
          <p>No orders found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
