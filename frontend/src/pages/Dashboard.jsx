import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/api';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { BookOpen, Users, AlertCircle, Truck, Plus, RefreshCw, Archive } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getDashboard();
      setData(response.data);
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>📚 SpiralTrack</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Classmate Spiral & Payment Management</p>
        </div>
        <button
          onClick={fetchDashboard}
          title="Refresh"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px' }}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Quick Navigation Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <Link to="/subjects" className="quick-nav-pill">
          <BookOpen size={18} color="#2563eb" />
          <span>Subjects</span>
        </Link>
        <Link to="/students" className="quick-nav-pill">
          <Users size={18} color="#0891b2" />
          <span>Students</span>
        </Link>
        <Link to="/pending" className="quick-nav-pill">
          <AlertCircle size={18} color="#dc2626" />
          <span>Pending Payments</span>
        </Link>
        <Link to="/delivery" className="quick-nav-pill">
          <Truck size={18} color="#16a34a" />
          <span>Delivery Tracking</span>
        </Link>
        <Link to="/history" className="quick-nav-pill">
          <Archive size={18} color="#7c3aed" />
          <span>History</span>
        </Link>
      </div>

      {/* Money Overview */}
      <div className="section-header" style={{ marginTop: '8px' }}>
        <h2 className="section-title">💰 Money Overview</h2>
      </div>
      <div className="stats-grid">
        <StatCard
          title="Collected"
          value={`₹${Number(data?.totalAmountCollected || 0).toFixed(0)}`}
          type="collected"
        />
        <StatCard
          title="Outstanding"
          value={`₹${Number(data?.totalOutstandingAmount || 0).toFixed(0)}`}
          type="pending"
        />
      </div>
      <div className="stats-grid">
        <StatCard title="Cash (All Time)" value={`₹${Number(data?.cashCollected || 0).toFixed(0)}`} type="collected" />
        <StatCard title="GPay (All Time)" value={`₹${Number(data?.gpayCollected || 0).toFixed(0)}`} type="collected" />
      </div>

      {/* Orders & Books Summary */}
      <div className="section-header">
        <h2 className="section-title">📦 Active Orders & Production</h2>
      </div>
      <div className="stats-grid">
        <StatCard title="Active Orders" value={data?.totalOrderRecords ?? 0} />
        <StatCard title="Active Copies" value={data?.totalCopiesOrdered ?? 0} />
      </div>

      {/* Delivery Pipeline */}
      <div className="section-header">
        <h2 className="section-title">🚚 Delivery Pipeline</h2>
        <Link to="/delivery" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
          Manage
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <div className="stat-card" style={{ padding: '10px' }}>
          <span className="stat-label" style={{ fontSize: '0.68rem', color: '#2563eb' }}>Awaiting</span>
          <span className="stat-value" style={{ fontSize: '1.25rem' }}>{data?.ordersAwaitingDelivery ?? 0}</span>
        </div>
        <div className="stat-card" style={{ padding: '10px' }}>
          <span className="stat-label" style={{ fontSize: '0.68rem', color: '#d97706' }}>Ready</span>
          <span className="stat-value" style={{ fontSize: '1.25rem' }}>{data?.ordersReadyForCollection ?? 0}</span>
        </div>
        <div className="stat-card" style={{ padding: '10px' }}>
          <span className="stat-label" style={{ fontSize: '0.68rem', color: '#16a34a' }}>Received</span>
          <span className="stat-value" style={{ fontSize: '1.25rem' }}>{data?.booksReceivedByStudents ?? 0}</span>
        </div>
        <div className="stat-card" style={{ padding: '10px' }}>
          <span className="stat-label" style={{ fontSize: '0.68rem', color: '#dc2626' }}>Received, unpaid</span>
          <span className="stat-value" style={{ fontSize: '1.25rem' }}>{data?.receivedButNotFullyPaid ?? 0}</span>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">History (All Time)</h2>
        <Link to="/history" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>View History</Link>
      </div>
      <div className="stats-grid">
        <StatCard title="Completed Orders" value={data?.historicalOrderRecords ?? 0} />
        <StatCard title="Historical Copies" value={data?.historicalCopies ?? 0} />
      </div>

      {/* Pending Payments Section */}
      <div className="section-header">
        <h2 className="section-title">Pending Payments ({data?.pendingPayments?.length || 0})</h2>
        <Link to="/pending" style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
          View All
        </Link>
      </div>

      {data?.pendingPayments && data.pendingPayments.length > 0 ? (
        <div className="card-list">
          {data.pendingPayments.slice(0, 5).map((item) => (
            <div
              key={item.orderId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Link
                to={`/orders/${item.orderId}`}
                style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.studentName}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {item.subjectName} • {item.quantity} copy
                </div>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.05rem' }}>
                  ₹{Number(item.remainingAmount).toFixed(0)}
                </span>
                <Link
                  to={`/orders/${item.orderId}`}
                  className="btn btn-sm btn-success"
                  style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '32px', textDecoration: 'none' }}
                >
                  Record
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <p>🎉 All payments are collected! No pending dues.</p>
        </div>
      )}

      {/* Primary Action Button */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/orders/new" className="btn btn-primary" style={{ padding: '14px' }}>
          <Plus size={20} />
          <span>+ ADD NEW ORDER</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
