import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubjectById, getOrdersBySubject, getOrderHistoryBySubject, updateSubject, updateDeliveryStatus } from '../api/api';
import OrderCard from '../components/OrderCard';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { ArrowLeft, Plus } from 'lucide-react';

const SubjectDetails = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [orders, setOrders] = useState([]);
  const [historicalOrders, setHistoricalOrders] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [deliveryFilter, setDeliveryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priceEditMode, setPriceEditMode] = useState(false);
  const [unitPrice, setUnitPrice] = useState('');
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceMessage, setPriceMessage] = useState('');

  const fetchSubjectData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subRes, ordersRes, historyRes] = await Promise.all([
        getSubjectById(id),
        getOrdersBySubject(id),
        getOrderHistoryBySubject(id),
      ]);
      setSubject(subRes.data);
      setUnitPrice(subRes.data.unitPrice == null ? '' : String(subRes.data.unitPrice));
      setOrders(ordersRes.data);
      setHistoricalOrders(historyRes.data);
    } catch (err) {
      setError('Unable to load subject details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectData();
  }, [id]);

  const handleSavePrice = async (event) => {
    event.preventDefault();
    const price = Number(unitPrice);
    if (!Number.isFinite(price) || price <= 0) {
      setPriceMessage('Fixed price must be greater than 0.');
      return;
    }

    try {
      setPriceSaving(true);
      setPriceMessage('');
      const response = await updateSubject(id, {
        name: subject.name,
        description: subject.description,
        unitPrice: price,
      });
      setSubject(response.data);
      setUnitPrice(String(response.data.unitPrice));
      setPriceEditMode(false);
      setPriceMessage('Fixed price saved.');
    } catch (err) {
      setPriceMessage(err.response?.data?.message || err.message || 'Failed to save fixed price.');
    } finally {
      setPriceSaving(false);
    }
  };

  const handleDeliveryChange = async (orderId, newStatus) => {
    try {
      await updateDeliveryStatus(orderId, newStatus);
      fetchSubjectData();
    } catch (err) {
      alert('Failed to update delivery status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (paymentFilter !== 'ALL' && o.paymentStatus.toUpperCase() !== paymentFilter) return false;
    if (deliveryFilter !== 'ALL' && o.deliveryStatus.toUpperCase() !== deliveryFilter) return false;
    return true;
  });

  if (loading) return <Loading message="Loading subject details..." />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!subject) return null;

  return (
    <div>
      <Link
        to="/subjects"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#64748b',
          textDecoration: 'none',
          fontSize: '0.85rem',
          marginBottom: '14px',
        }}
      >
        <ArrowLeft size={16} /> Back to Subjects
      </Link>

      {/* Subject Header */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{subject.name}</h1>
            {subject.description && (
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                {subject.description}
              </p>
            )}
            <p style={{ fontSize: '0.85rem', color: subject.unitPrice ? '#16a34a' : '#dc2626', marginTop: '6px' }}>
              {subject.unitPrice
                ? `Fixed price: ₹${Number(subject.unitPrice).toFixed(2)} per copy`
                : 'Fixed price is not set'}
            </p>
          </div>
          <Link
            to={`/orders/new?subjectId=${subject.id}&subjectName=${encodeURIComponent(subject.name)}`}
            className="btn btn-sm btn-primary"
          >
            <Plus size={16} /> New Order
          </Link>
        </div>
        {priceEditMode ? (
          <form onSubmit={handleSavePrice} style={{ display: 'flex', gap: '8px', alignItems: 'end', marginTop: '12px' }}>
            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label className="form-label">Fixed price per copy (₹)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value)}
                readOnly={subject.name.trim().toUpperCase() === 'OS'}
                required
              />
            </div>
            <button type="submit" className="btn btn-sm btn-primary" disabled={priceSaving}>
              {priceSaving ? 'Saving...' : 'Save price'}
            </button>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => setPriceEditMode(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ marginTop: '10px' }}
            onClick={() => {
              setUnitPrice(subject.name.trim().toUpperCase() === 'OS'
                ? '140'
                : subject.unitPrice == null ? '' : String(subject.unitPrice));
              setPriceMessage('');
              setPriceEditMode(true);
            }}
          >
            {subject.unitPrice ? 'Update fixed price' : 'Set fixed price'}
          </button>
        )}
        {priceMessage && <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>{priceMessage}</p>}
      </div>

      {/* Summary Metrics */}
      <div className="stats-grid">
        <StatCard title="Total Copies" value={subject.totalCopiesOrdered} />
        <StatCard title="Received" value={subject.totalCopiesReceived} type="collected" />
        <StatCard title="Collected" value={`₹${Number(subject.totalCollected || 0).toFixed(0)}`} type="collected" />
        <StatCard title="Outstanding" value={`₹${Number(subject.outstandingAmount || 0).toFixed(0)}`} type="pending" />
      </div>

      {/* Filter Bars */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>PAYMENT FILTER</div>
        <div className="filter-bar">
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

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>DELIVERY FILTER</div>
        <div className="filter-bar">
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

      {/* Orders List */}
      <div className="section-header">
        <h2 className="section-title">Students Who Ordered ({filteredOrders.length})</h2>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="card-list">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleDeliveryChange}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No orders found matching the filters.</p>
        </div>
      )}

      <div className="section-header">
        <h2 className="section-title">Completed History ({historicalOrders.length})</h2>
      </div>
      {historicalOrders.length ? (
        <div className="card-list">
          {historicalOrders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      ) : (
        <div className="empty-state"><p>No completed orders in history for {subject.name}.</p></div>
      )}
    </div>
  );
};

export default SubjectDetails;
