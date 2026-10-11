import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentById, getOrdersByStudent, getOrderHistoryByStudent, updateDeliveryStatus } from '../api/api';
import OrderCard from '../components/OrderCard';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { ArrowLeft, Phone, Plus } from 'lucide-react';

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [historicalOrders, setHistoricalOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentRes, ordersRes, historyRes] = await Promise.all([
        getStudentById(id),
        getOrdersByStudent(id),
        getOrderHistoryByStudent(id),
      ]);
      setStudent(studentRes.data);
      setOrders(ordersRes.data);
      setHistoricalOrders(historyRes.data);
    } catch (err) {
      setError('Unable to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const handleDeliveryChange = async (orderId, newStatus) => {
    try {
      await updateDeliveryStatus(orderId, newStatus);
      fetchStudentData();
    } catch (err) {
      alert('Failed to update delivery status');
    }
  };

  if (loading) return <Loading message="Loading student profile..." />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!student) return null;

  return (
    <div>
      <Link
        to="/students"
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
        <ArrowLeft size={16} /> Back to Students
      </Link>

      {/* Student Profile Header */}
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
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{student.name}</h1>
            {student.phone && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                <Phone size={14} /> {student.phone}
              </p>
            )}
          </div>
          <Link
            to={`/orders/new?studentId=${student.id}&studentName=${encodeURIComponent(student.name)}`}
            className="btn btn-sm btn-primary"
          >
            <Plus size={16} /> Add Order
          </Link>
        </div>
      </div>

      {/* Student Metrics */}
      <div className="stats-grid">
        <StatCard title="Total Ordered" value={`₹${Number(student.totalAmount || 0).toFixed(0)}`} />
        <StatCard title="Paid" value={`₹${Number(student.totalPaid || 0).toFixed(0)}`} type="collected" />
        <StatCard title="Outstanding" value={`₹${Number(student.totalOutstanding || 0).toFixed(0)}`} type="pending" />
        <StatCard
          title="Copies Received"
          value={`${student.totalCopiesReceived} / ${student.totalCopiesOrdered}`}
        />
      </div>

      {/* Order History */}
      <div className="section-header">
        <h2 className="section-title">Order History ({orders.length})</h2>
      </div>

      {orders.length > 0 ? (
        <div className="card-list">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleDeliveryChange}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No orders recorded yet for {student.name}.</p>
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
        <div className="empty-state"><p>No completed orders in history for {student.name}.</p></div>
      )}
    </div>
  );
};

export default StudentDetails;
