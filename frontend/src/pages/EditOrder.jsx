import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById, updateOrder } from '../api/api';
import PaymentBadge from '../components/PaymentBadge';
import DeliveryBadge from '../components/DeliveryBadge';
import Loading from '../components/Loading';
import { ArrowLeft } from 'lucide-react';

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectId, setSubjectId] = useState(null);

  const [quantity, setQuantity] = useState('1');
  const [pages, setPages] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [amountPaid, setAmountPaid] = useState('0');
  const [deliveryStatus, setDeliveryStatus] = useState('ORDERED');
  const [orderDate, setOrderDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrderById(id);
        const o = res.data;
        if (o.archived) {
          navigate('/history', { replace: true });
          return;
        }
        setStudentId(o.studentId);
        setStudentName(o.studentName);
        setSubjectId(o.subjectId);
        setSubjectName(o.subjectName);

        setQuantity(o.quantity ? o.quantity.toString() : '1');
        setPages(o.pages ? o.pages.toString() : '');
        const orderQuantity = o.quantity || 1;
        setUnitPrice(String(o.unitPrice ?? (Number(o.totalAmount) / orderQuantity)));
        setAmountPaid(o.amountPaid.toString());
        setDeliveryStatus(o.deliveryStatus || 'ORDERED');
        setOrderDate(o.orderDate);
        setNotes(o.notes || '');
      } catch (err) {
        setError('Failed to fetch order details for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const totalNum = (Number(unitPrice) || 0) * (parseInt(quantity, 10) || 0);
  const totalAmount = totalNum > 0 ? totalNum.toFixed(2) : '';
  const paidNum = parseFloat(amountPaid) || 0;
  const remainingNum = Math.max(0, totalNum - paidNum);

  let previewStatus = 'PENDING';
  if (paidNum > 0 && paidNum < totalNum) {
    previewStatus = 'PARTIAL';
  } else if (paidNum >= totalNum && totalNum > 0) {
    previewStatus = 'PAID';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!quantity || parseInt(quantity) <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (totalNum <= 0) {
      setError('Order total must be greater than 0.');
      return;
    }
    if (parseFloat(amountPaid) < 0) {
      setError('Amount paid cannot be negative.');
      return;
    }
    if (parseFloat(amountPaid) > totalNum) {
      setError('Amount paid cannot exceed total amount.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        studentId,
        subjectId,
        quantity: parseInt(quantity),
        pages: pages && parseInt(pages) > 0 ? parseInt(pages) : null,
        totalAmount: totalNum,
        amountPaid: parseFloat(amountPaid),
        deliveryStatus,
        orderDate,
        notes: notes.trim() || null,
      };

      await updateOrder(id, payload);
      navigate(`/orders/${id}`);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors && typeof resp.errors === 'object') {
        const errorList = Object.values(resp.errors).join(', ');
        setError(errorList || resp.message || 'Validation failed');
      } else {
        setError(resp?.message || 'Failed to update order.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading order..." />;

  return (
    <div>
      <Link
        to={`/orders/${id}`}
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
        <ArrowLeft size={16} /> Back to Order
      </Link>

      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>
        EDIT ORDER #{id}
      </h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="form-group">
            <label className="form-label">Student</label>
            <input type="text" className="form-input" value={studentName} disabled style={{ background: '#f1f5f9' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" className="form-input" value={subjectName} disabled style={{ background: '#f1f5f9' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              min="1"
              className="form-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pages (Optional)</label>
            <input
              type="number"
              min="1"
              className="form-input"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Fixed price per copy (₹)</label>
            <input
              type="number"
              className="form-input"
              value={unitPrice}
              readOnly
              aria-readonly="true"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Total Amount (₹) — fixed price × quantity</label>
            <input
              type="number"
              className="form-input"
              value={totalAmount}
              readOnly
              aria-readonly="true"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Amount Paid (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              value={amountPaid}
              readOnly
              aria-readonly="true"
              required
            />
          </div>
        </div>

        {/* Live Status Calculation Preview */}
        {totalNum > 0 && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>UPDATED PAYMENT STATUS</div>
              <div style={{ marginTop: '4px' }}>
                <PaymentBadge status={previewStatus} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>UPDATED REMAINING</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: remainingNum > 0 ? '#dc2626' : '#16a34a' }}>
                ₹{remainingNum.toFixed(0)}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Delivery Status</label>
            <select
              className="form-select"
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
            >
              <option value="ORDERED">ORDERED</option>
              <option value="READY">READY</option>
              <option value="RECEIVED">RECEIVED</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Order Date</label>
            <input
              type="date"
              className="form-input"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '8px' }}>
          {submitting ? 'Saving Changes...' : 'Update Order'}
        </button>
      </form>
    </div>
  );
};

export default EditOrder;
