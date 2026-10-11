import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById, updateDeliveryStatus, recordPayment, archiveOrder } from '../api/api';
import PaymentBadge from '../components/PaymentBadge';
import DeliveryBadge from '../components/DeliveryBadge';
import Loading from '../components/Loading';
import { ArrowLeft, Edit, User, BookOpen, Layers, Calendar, FileText } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [addPaymentAmount, setAddPaymentAmount] = useState('');
  const [addPaymentMethod, setAddPaymentMethod] = useState('CASH');
  const [paymentNotes, setPaymentNotes] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getOrderById(id);
      setOrder(res.data);
    } catch (err) {
      setError('Order not found or unable to fetch details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleRecordAdditionalPayment = async (e) => {
    e.preventDefault();
    const amt = parseFloat(addPaymentAmount);
    if (!amt || amt <= 0) {
      setError('Enter a payment amount greater than 0.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');
      await recordPayment(id, {
        amount: amt,
        paymentMethod: addPaymentMethod,
        notes: paymentNotes.trim() || null,
      });
      setAddPaymentAmount('');
      setPaymentNotes('');
      await fetchOrder();
      setSuccess('Payment recorded.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliveryChange = async (newStatus) => {
    try {
      setActionLoading(true);
      setError('');
      await updateDeliveryStatus(id, newStatus);
      await fetchOrder();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update delivery status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (order.paymentStatus !== 'PAID' || order.deliveryStatus !== 'RECEIVED') {
      setError('The order must be fully paid and marked received before it can be moved to History.');
      return;
    }
    if (!window.confirm('This order is fully paid and received. Move it to History?')) return;
    try {
      setActionLoading(true);
      setError('');
      await archiveOrder(id);
      navigate('/history', { state: { success: `Order #${id} moved to History.` } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to move order to History.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading message="Loading order details..." />;
  if (!order) return null;

  return (
    <div>
      <Link
        to={order.archived ? '/history' : '/orders'}
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
        <ArrowLeft size={16} /> {order.archived ? 'Back to History' : 'Back to Orders'}
      </Link>

      <div className="form-card" style={{ marginBottom: '16px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {order.archived && <div className="alert alert-success">This completed order is in History and is read-only.</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Order #{order.id}
            </span>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>
              {order.subjectName}
            </h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <PaymentBadge status={order.paymentStatus} />
            <DeliveryBadge status={order.deliveryStatus} />
          </div>
        </div>

        {/* Info Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} color="#64748b" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Student</div>
              <Link to={`/students/${order.studentId}`} style={{ fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                {order.studentName} {order.studentPhone ? `(${order.studentPhone})` : ''}
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={18} color="#64748b" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Subject / Book</div>
              <Link to={`/subjects/${order.subjectId}`} style={{ fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                {order.subjectName}
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="#64748b" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Quantity & Pages</div>
              <div style={{ fontWeight: 600 }}>
                {order.quantity} {order.quantity === 1 ? 'copy' : 'copies'}
                {order.pages ? ` • ${order.pages} pages` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="#64748b" />
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Order Date</div>
              <div style={{ fontWeight: 600 }}>{order.orderDate}</div>
            </div>
          </div>

          {order.notes && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <FileText size={18} color="#64748b" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Notes</div>
                <div style={{ fontSize: '0.9rem', color: '#334155' }}>{order.notes}</div>
              </div>
            </div>
          )}
          {order.completedAt && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Completed</div>
              <div style={{ fontWeight: 600 }}>{new Date(order.completedAt).toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* DELIVERY PIPELINE CONTROL */}
        {!order.archived && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px',
            marginTop: '8px',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Update Delivery Status (Independent)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              onClick={() => handleDeliveryChange('ORDERED')}
              disabled={actionLoading || order.deliveryStatus === 'ORDERED'}
              className={`btn btn-sm ${order.deliveryStatus === 'ORDERED' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 4px', fontSize: '0.75rem' }}
            >
              ORDERED
            </button>
            <button
              onClick={() => handleDeliveryChange('READY')}
              disabled={actionLoading || order.deliveryStatus === 'READY'}
              className={`btn btn-sm ${order.deliveryStatus === 'READY' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 4px', fontSize: '0.75rem' }}
            >
              READY
            </button>
            <button
              onClick={() => handleDeliveryChange('RECEIVED')}
              disabled={actionLoading || order.deliveryStatus === 'RECEIVED'}
              className={`btn btn-sm ${order.deliveryStatus === 'RECEIVED' ? 'btn-success' : 'btn-outline'}`}
              style={{ padding: '6px 4px', fontSize: '0.75rem' }}
            >
              RECEIVED
            </button>
          </div>
        </div>
        )}

        {/* PAYMENT SUMMARY BOX */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '14px',
            marginTop: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Amount</span>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>₹{Number(order.totalAmount).toFixed(0)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Amount Paid</span>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#16a34a' }}>
              ₹{Number(order.amountPaid).toFixed(0)}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontWeight: 700, color: '#334155' }}>Remaining Balance</span>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: Number(order.remainingAmount) > 0 ? '#dc2626' : '#16a34a' }}>
              ₹{Number(order.remainingAmount).toFixed(0)}
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
            Payment Transactions
          </div>
          {order.payments?.length ? order.payments.map((payment) => (
            <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '5px 0', fontSize: '0.85rem' }}>
              <span>{payment.paymentMethod === 'CASH' ? 'Cash' : payment.paymentMethod === 'GPAY' ? 'GPay' : 'Not specified'}{payment.paymentDate ? ` · ${new Date(payment.paymentDate).toLocaleString()}` : ''}</span>
              <strong>₹{Number(payment.amount).toFixed(2)}</strong>
            </div>
          )) : <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No payment transactions recorded.</div>}
        </div>

        {/* PARTIAL PAYMENT ENTRY */}
        {!order.archived && order.paymentStatus !== 'PAID' && (
          <form onSubmit={handleRecordAdditionalPayment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={order.remainingAmount}
              placeholder={`Amount (max ₹${Number(order.remainingAmount).toFixed(2)})`}
              value={addPaymentAmount}
              onChange={(e) => setAddPaymentAmount(e.target.value)}
              className="form-input"
              aria-label="Payment amount"
              required
            />
            <select className="form-select" aria-label="Payment method" value={addPaymentMethod} onChange={(e) => setAddPaymentMethod(e.target.value)}>
              <option value="CASH">Cash</option>
              <option value="GPAY">GPay</option>
            </select>
            <input
              type="text"
              className="form-input"
              placeholder="Payment note (optional)"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              style={{ gridColumn: '1 / -1' }}
            />
            <button type="submit" disabled={actionLoading} className="btn btn-outline" style={{ gridColumn: '1 / -1' }}>
              {actionLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </form>
        )}

        {/* ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          {!order.archived && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/orders/${order.id}/edit`} className="btn btn-outline" style={{ flex: 1 }}>
                <Edit size={16} /> Edit
              </Link>
              <button
                type="button"
                onClick={handleArchive}
                disabled={actionLoading || order.paymentStatus !== 'PAID' || order.deliveryStatus !== 'RECEIVED'}
                className="btn btn-primary"
                style={{ flex: 1 }}
                title="An order must be fully paid and received before moving to History."
              >
                {actionLoading ? 'Moving...' : 'Move to History'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
