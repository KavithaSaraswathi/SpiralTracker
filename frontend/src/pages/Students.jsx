import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudents, createStudent } from '../api/api';
import Loading from '../components/Loading';
import { Search, Plus, X, ChevronRight, Phone, BookOpen } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Student Modal state
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      setError('Unable to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setModalLoading(true);
      setModalError('');
      await createStudent({
        name: newName.trim(),
        phone: newPhone.trim() || null,
      });
      setNewName('');
      setNewPhone('');
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create student');
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phone && s.phone.includes(searchQuery))
  );

  return (
    <div>
      <div className="section-header" style={{ marginTop: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Students</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Classmate directory & balances</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-sm btn-primary">
          <Plus size={16} /> New Student
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search Input */}
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search by student name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading message="Loading students..." />
      ) : filtered.length > 0 ? (
        <div className="card-list">
          {filtered.map((student) => (
            <Link
              key={student.id}
              to={`/students/${student.id}`}
              className="order-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                    }}
                  >
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{student.name}</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {student.distinctSubjectsCount} {student.distinctSubjectsCount === 1 ? 'subject' : 'subjects'} • {student.totalCopiesOrdered} copies
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: Number(student.totalOutstanding || 0) > 0 ? '#dc2626' : '#16a34a',
                    }}
                  >
                    ₹{Number(student.totalOutstanding || 0).toFixed(0)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {Number(student.totalOutstanding || 0) > 0 ? 'Owed' : 'Cleared'}
                  </div>
                </div>
              </div>

              {/* Progress and status indicators */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  marginTop: '2px',
                }}
              >
                <span>
                  Received: <strong style={{ color: '#16a34a' }}>{student.totalCopiesReceived}</strong> / {student.totalCopiesOrdered}
                </span>
                <span>
                  Awaiting Delivery: <strong style={{ color: student.ordersAwaitingDelivery > 0 ? '#d97706' : '#64748b' }}>{student.ordersAwaitingDelivery}</strong>
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state-icon">👥</p>
          <p>No students found.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-sm btn-outline" style={{ marginTop: '10px' }}>
            + Add First Student
          </button>
        </div>
      )}

      {/* Add Student Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Add Student</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {modalError && <div className="alert alert-error">{modalError}</div>}

            <form onSubmit={handleAddStudent}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Student Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Samima, Kavi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <button type="submit" disabled={modalLoading} className="btn btn-primary">
                {modalLoading ? 'Adding...' : 'Add Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
