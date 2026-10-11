import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Archive, Search } from 'lucide-react';
import { getOrderHistory } from '../api/api';
import DeliveryBadge from '../components/DeliveryBadge';
import Loading from '../components/Loading';
import PaymentBadge from '../components/PaymentBadge';

const formatPaymentMethod = (method) => {
  if (method === 'CASH') return 'Cash';
  if (method === 'GPAY') return 'GPay';
  return 'Not specified';
};

const History = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [student, setStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const success = location.state?.success || '';

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getOrderHistory({
          student: student.trim() || undefined,
          subject: subject.trim() || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          paymentMethod: paymentMethod || undefined,
        });
        if (!cancelled) setOrders(response.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Unable to load order history.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [student, subject, fromDate, toDate, paymentMethod]);

  return (
    <div>
      <div className="section-header" style={{ marginTop: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>History</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Completed, paid and received orders (read-only)</p>
        </div>
        <Archive size={20} color="#64748b" />
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="search"
          className="search-input"
          placeholder="Filter by student name..."
          value={student}
          onChange={(event) => setStudent(event.target.value)}
        />
      </div>
      <div className="form-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="history-subject">Subject</label>
          <input id="history-subject" className="form-input" placeholder="Any subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="history-method">Payment method</label>
          <select id="history-method" className="form-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="">All methods</option>
            <option value="CASH">Cash</option>
            <option value="GPAY">GPay</option>
            <option value="UNSPECIFIED">Not specified</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="history-from">Order date from</label>
          <input id="history-from" type="date" className="form-input" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="history-to">Order date to</label>
          <input id="history-to" type="date" className="form-input" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Completed Orders ({orders.length})</h2>
      </div>
      {loading ? (
        <Loading message="Loading order history..." />
      ) : orders.length ? (
        <div className="card-list">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="order-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card-top">
                <div>
                  <div className="person-name">{order.studentName}</div>
                  <div className="order-meta"><strong style={{ color: '#2563eb' }}>{order.subjectName}</strong> · {order.quantity} {order.quantity === 1 ? 'copy' : 'copies'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <PaymentBadge status={order.paymentStatus} />
                  <DeliveryBadge status={order.deliveryStatus} />
                </div>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                <span>Total: ₹{Number(order.totalAmount).toFixed(2)}</span>
                <span>Paid: ₹{Number(order.amountPaid).toFixed(2)}</span>
                <span>Balance: ₹{Number(order.remainingAmount).toFixed(2)}</span>
                <span>Order date: {order.orderDate}</span>
                <span style={{ gridColumn: '1 / -1' }}>Completed: {order.completedAt ? new Date(order.completedAt).toLocaleString() : '—'}</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '0.8rem' }}>
                <strong>Payments</strong>
                {order.payments?.length ? order.payments.map((payment) => (
                  <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', color: '#475569' }}>
                    <span>{formatPaymentMethod(payment.paymentMethod)} · {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : ''}</span>
                    <span>₹{Number(payment.amount).toFixed(2)}</span>
                  </div>
                )) : <div style={{ color: '#64748b' }}>Not specified</div>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state-icon">📚</p>
          <p>No completed orders in History match these filters.</p>
        </div>
      )}
    </div>
  );
};

export default History;
