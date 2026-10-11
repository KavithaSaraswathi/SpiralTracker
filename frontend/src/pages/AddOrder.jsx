import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getStudents, getSubjects, createStudent, createSubject, createOrder } from '../api/api';
import PaymentBadge from '../components/PaymentBadge';
import { ArrowLeft, UserPlus, BookPlus, Users, BookOpen } from 'lucide-react';

const AddOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Toggles for Student and Subject selection vs new creation
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [isNewSubject, setIsNewSubject] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState(searchParams.get('studentId') || '');
  const [studentName, setStudentName] = useState(searchParams.get('studentName') || '');
  const [studentPhone, setStudentPhone] = useState('');

  const [subjectId, setSubjectId] = useState(searchParams.get('subjectId') || '');
  const [subjectName, setSubjectName] = useState(searchParams.get('subjectName') || '');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [subjectPrice, setSubjectPrice] = useState(
    searchParams.get('subjectName')?.trim().toUpperCase() === 'OS' ? '140' : '',
  );

  const [quantity, setQuantity] = useState('1');
  const [pages, setPages] = useState(''); // Optional!
  const [amountPaid, setAmountPaid] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [deliveryStatus, setDeliveryStatus] = useState('ORDERED');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);
  const [savingSubject, setSavingSubject] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studRes, subRes] = await Promise.all([getStudents(), getSubjects()]);
        setStudents(studRes.data);
        setSubjects(subRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load students and subjects.');
      }
    };
    loadData();
  }, []);

  const refreshStudents = async () => {
    const response = await getStudents();
    setStudents(response.data);
    return response.data;
  };

  const refreshSubjects = async () => {
    const response = await getSubjects();
    setSubjects(response.data);
    return response.data;
  };

  const handleCreateStudent = async () => {
    const name = studentName.trim();
    if (!name) {
      setError('Please enter student name.');
      return;
    }

    try {
      setSavingStudent(true);
      setError('');
      setSuccess('');
      const response = await createStudent({
        name,
        phone: studentPhone.trim() || null,
      });
      const savedStudent = response.data;
      if (!savedStudent?.id) {
        throw new Error('The server did not return the saved student ID.');
      }

      setStudents((current) => [
        ...current.filter((student) => student.id !== savedStudent.id),
        savedStudent,
      ]);
      setStudentId(String(savedStudent.id));
      setStudentName('');
      setStudentPhone('');
      setIsNewStudent(false);
      setSuccess(`Student "${savedStudent.name}" created and selected.`);

      try {
        const refreshed = await refreshStudents();
        if (!refreshed.some((student) => student.id === savedStudent.id)) {
          setStudents((current) => [...current, savedStudent]);
        }
      } catch (refreshError) {
        setError(`Student was saved and selected, but the list could not be refreshed: ${refreshError.response?.data?.message || refreshError.message}`);
      }
    } catch (err) {
      const response = err.response?.data;
      const fieldErrors = response?.errors && typeof response.errors === 'object'
        ? Object.values(response.errors).join(', ')
        : '';
      setError(fieldErrors || response?.message || err.message || 'Failed to create student.');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleCreateSubject = async () => {
    const name = subjectName.trim();
    if (!name) {
      setError('Please enter subject name.');
      return;
    }
    if (!subjectPrice || Number(subjectPrice) <= 0) {
      setError('Enter a fixed price greater than 0 for this subject.');
      return;
    }

    try {
      setSavingSubject(true);
      setError('');
      setSuccess('');
      const response = await createSubject({
        name,
        description: subjectDesc.trim() || null,
        unitPrice: Number(subjectPrice),
      });
      const savedSubject = response.data;
      if (!savedSubject?.id) {
        throw new Error('The server did not return the saved subject ID.');
      }

      setSubjects((current) => [
        ...current.filter((subject) => subject.id !== savedSubject.id),
        savedSubject,
      ]);
      setSubjectId(String(savedSubject.id));
      setSubjectName('');
      setSubjectDesc('');
      setSubjectPrice('');
      setIsNewSubject(false);
      setSuccess(`Subject "${savedSubject.name}" created and selected.`);

      try {
        const refreshed = await refreshSubjects();
        if (!refreshed.some((subject) => subject.id === savedSubject.id)) {
          setSubjects((current) => [...current, savedSubject]);
        }
      } catch (refreshError) {
        setError(`Subject was saved and selected, but the list could not be refreshed: ${refreshError.response?.data?.message || refreshError.message}`);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        try {
          const refreshed = await refreshSubjects();
          const existingSubject = refreshed.find(
            (subject) => subject.name?.trim().toLowerCase() === name.toLowerCase(),
          );
          if (existingSubject) {
            setSubjectId(String(existingSubject.id));
            setSubjectName('');
            setSubjectDesc('');
            setSubjectPrice('');
            setIsNewSubject(false);
            setSuccess(`Subject "${existingSubject.name}" already exists and has been selected.`);
            return;
          }
        } catch (refreshError) {
          setError(`Subject already exists, but the subject list could not be refreshed: ${refreshError.response?.data?.message || refreshError.message}`);
          return;
        }
      }
      const response = err.response?.data;
      const fieldErrors = response?.errors && typeof response.errors === 'object'
        ? Object.values(response.errors).join(', ')
        : '';
      setError(fieldErrors || response?.message || err.message || 'Failed to create subject.');
    } finally {
      setSavingSubject(false);
    }
  };

  const selectedSubject = subjects.find((subject) => String(subject.id) === String(subjectId));
  const unitPrice = isNewSubject
    ? Number(subjectPrice) || 0
    : Number(selectedSubject?.unitPrice) || 0;
  const totalNum = unitPrice * (parseInt(quantity, 10) || 0);
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

    // Validations
    if (!studentId) {
      setError(isNewStudent
        ? 'Save the new student before creating the order.'
        : 'Please select a student or add a new student.');
      return;
    }

    if (!subjectId) {
      setError(isNewSubject
        ? 'Save the new subject before creating the order.'
        : 'Please select a subject or create a new subject.');
      return;
    }
    if (unitPrice <= 0) {
      setError('Set a fixed price for this subject before creating an order.');
      return;
    }

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
      setLoading(true);

      const payload = {
        studentId: Number(studentId),
        subjectId: Number(subjectId),

        quantity: parseInt(quantity),
        pages: pages && parseInt(pages) > 0 ? parseInt(pages) : null, // Pages are strictly optional
        totalAmount: totalNum,
        amountPaid: parseFloat(amountPaid || 0),
        paymentMethod: paidNum > 0 ? paymentMethod : null,
        deliveryStatus,
        orderDate,
        notes: notes.trim() || null,
      };

      await createOrder(payload);
      setSuccess('Order created successfully!');
      setTimeout(() => {
        navigate('/orders');
      }, 700);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors && typeof resp.errors === 'object') {
        const errorList = Object.values(resp.errors).join(', ');
        setError(errorList || resp.message || 'Validation failed');
      } else {
        setError(resp?.message || 'Failed to create order. Please check all required fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        to="/orders"
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
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>
        ADD ORDER
      </h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        {/* STUDENT SECTION */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
          <button
            type="button"
            onClick={() => {
              setIsNewStudent(false);
              setStudentName('');
              setStudentPhone('');
              setError('');
            }}
            className={`btn btn-sm ${!isNewStudent ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <Users size={16} /> Select Student
          </button>
          <button
            type="button"
            onClick={() => {
              setIsNewStudent(true);
              setStudentId('');
              setError('');
            }}
            className={`btn btn-sm ${isNewStudent ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <UserPlus size={16} /> + New Student
          </button>
        </div>

        {!isNewStudent ? (
          <div className="form-group">
            <label className="form-label">Student Name *</label>
            <select
              className="form-select"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">-- Choose classmate --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.phone ? `(${s.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">New Student Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Samima"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone (Optional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="9876543210"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ gridColumn: '1 / -1' }}
              disabled={savingStudent || loading}
              onClick={handleCreateStudent}
            >
              {savingStudent ? 'Saving student...' : 'Save and select student'}
            </button>
          </div>
        )}

        {/* SUBJECT SECTION */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginBottom: '2px' }}>
          <button
            type="button"
            onClick={() => {
              setIsNewSubject(false);
              setSubjectName('');
              setSubjectDesc('');
              setSubjectPrice('');
              setError('');
            }}
            className={`btn btn-sm ${!isNewSubject ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <BookOpen size={16} /> Select Subject
          </button>
          <button
            type="button"
            onClick={() => {
              setIsNewSubject(true);
              setSubjectId('');
              setError('');
            }}
            className={`btn btn-sm ${isNewSubject ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <BookPlus size={16} /> + New Subject
          </button>
        </div>

        {!isNewSubject ? (
          <div className="form-group">
            <label className="form-label">Subject / Book *</label>
            <select
              className="form-select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">-- Choose subject --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} — {sub.unitPrice
                    ? `₹${Number(sub.unitPrice).toFixed(2)} / copy`
                    : 'fixed price not set'}
                </option>
              ))}
            </select>
            {selectedSubject && !selectedSubject.unitPrice && (
              <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '6px' }}>
                This subject needs a fixed price. Set it from the Subjects page before creating an order.
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">New Subject Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. OS, GP, OOPS"
                value={subjectName}
                onChange={(e) => {
                  const name = e.target.value;
                  setSubjectName(name);
                  if (name.trim().toUpperCase() === 'OS') setSubjectPrice('140');
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fixed price per copy (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                value={subjectPrice}
                onChange={(e) => setSubjectPrice(e.target.value)}
                readOnly={subjectName.trim().toUpperCase() === 'OS'}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="Optional description"
                value={subjectDesc}
                onChange={(e) => setSubjectDesc(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ gridColumn: '1 / -1' }}
              disabled={savingSubject || loading}
              onClick={handleCreateSubject}
            >
              {savingSubject ? 'Saving subject...' : 'Save and select subject'}
            </button>
          </div>
        )}

        {/* QUANTITY & PAGES (Pages optional) */}
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
              placeholder="e.g. 85"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
            />
          </div>
        </div>

        {/* AMOUNTS */}
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
            <label className="form-label">Amount Paid (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              placeholder="Default 0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </div>
        </div>
        {paidNum > 0 && (
          <div className="form-group">
            <label className="form-label">Payment Method *</label>
            <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
              <option value="CASH">Cash</option>
              <option value="GPAY">GPay</option>
            </select>
          </div>
        )}

        {/* LIVE PAYMENT PREVIEW */}
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
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>CALCULATED PAYMENT</div>
              <div style={{ marginTop: '4px' }}>
                <PaymentBadge status={previewStatus} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>REMAINING AMOUNT</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: remainingNum > 0 ? '#dc2626' : '#16a34a' }}>
                ₹{remainingNum.toFixed(0)}
              </div>
            </div>
          </div>
        )}

        {/* DELIVERY STATUS & ORDER DATE */}
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
          <label className="form-label">Optional Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Special instructions, binding color, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading || savingStudent || savingSubject} className="btn btn-primary" style={{ marginTop: '8px' }}>
          {loading ? 'Saving...' : 'Save Order'}
        </button>
      </form>
    </div>
  );
};

export default AddOrder;
