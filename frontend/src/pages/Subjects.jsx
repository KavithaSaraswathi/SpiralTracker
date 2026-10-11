import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSubjects, createSubject } from '../api/api';
import Loading from '../components/Loading';
import { BookOpen, Search, Plus, X, Layers, CheckCircle, Clock } from 'lucide-react';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Subject Modal state
  const [showModal, setShowModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubPrice, setNewSubPrice] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getSubjects();
      setSubjects(response.data);
    } catch (err) {
      setError('Unable to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    if (!newSubPrice || Number(newSubPrice) <= 0) {
      setModalError('Subject price must be greater than 0.');
      return;
    }

    try {
      setModalLoading(true);
      setModalError('');
      await createSubject({
        name: newSubName.trim(),
        description: newSubDesc.trim() || null,
        unitPrice: Number(newSubPrice),
      });
      setNewSubName('');
      setNewSubDesc('');
      setNewSubPrice('');
      setShowModal(false);
      fetchSubjects();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div className="section-header" style={{ marginTop: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Subjects</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Manage books & study materials</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-sm btn-primary">
          <Plus size={16} /> New Subject
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search Input */}
      <div className="search-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search subjects (e.g. OS, GP, OOPS)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading message="Loading subjects..." />
      ) : filtered.length > 0 ? (
        <div className="card-list">
          {filtered.map((sub) => (
            <Link
              key={sub.id}
              to={`/subjects/${sub.id}`}
              className="order-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>
                    {sub.name}
                  </h3>
                  {sub.description && (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {sub.description}
                    </p>
                  )}
                  <p style={{ fontSize: '0.8rem', color: sub.unitPrice ? '#16a34a' : '#dc2626', marginTop: '4px' }}>
                    {sub.unitPrice
                      ? `Fixed price: ₹${Number(sub.unitPrice).toFixed(2)} / copy`
                      : 'Fixed price not set — open subject to set it'}
                  </p>
                </div>
                <span className="badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  {sub.totalOrdersCount} {sub.totalOrdersCount === 1 ? 'Order' : 'Orders'}
                </span>
              </div>

              {/* Subject Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  background: '#f8fafc',
                  padding: '8px',
                  borderRadius: '8px',
                  marginTop: '4px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>COPIES</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sub.totalCopiesOrdered}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>RECEIVED</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#16a34a' }}>
                    {sub.totalCopiesReceived}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 600 }}>AWAITING</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#dc2626' }}>
                    {sub.outstandingDeliveries}
                  </div>
                </div>
              </div>

              {/* Financial bottom bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px dashed #e2e8f0',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ color: '#64748b' }}>Collected: </span>
                  <strong style={{ color: '#16a34a' }}>₹{Number(sub.totalCollected || 0).toFixed(0)}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Outstanding: </span>
                  <strong style={{ color: Number(sub.outstandingAmount) > 0 ? '#dc2626' : '#16a34a' }}>
                    ₹{Number(sub.outstandingAmount || 0).toFixed(0)}
                  </strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state-icon">📚</p>
          <p>No subjects found.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-sm btn-outline" style={{ marginTop: '10px' }}>
            + Create First Subject
          </button>
        </div>
      )}

      {/* Add Subject Modal */}
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
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Add New Subject</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {modalError && <div className="alert alert-error">{modalError}</div>}

            <form onSubmit={handleAddSubject}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Subject Code / Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. OS, OOPS, GP, DS"
                  value={newSubName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewSubName(name);
                    if (name.trim().toUpperCase() === 'OS') setNewSubPrice('140');
                  }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Fixed price per copy (₹) *</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="form-input"
                  value={newSubPrice}
                  onChange={(e) => setNewSubPrice(e.target.value)}
                  readOnly={newSubName.trim().toUpperCase() === 'OS'}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Description (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 5 Units complete notes"
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                />
              </div>

              <button type="submit" disabled={modalLoading} className="btn btn-primary">
                {modalLoading ? 'Creating...' : 'Create Subject'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
