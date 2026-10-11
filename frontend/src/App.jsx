import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetails from './pages/SubjectDetails';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import AddOrder from './pages/AddOrder';
import EditOrder from './pages/EditOrder';
import PendingPayments from './pages/PendingPayments';
import DeliveryTracking from './pages/DeliveryTracking';
import History from './pages/History';
import { Plus } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:id" element={<SubjectDetails />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentDetails />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/history" element={<History />} />
            <Route path="/orders/new" element={<AddOrder />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/orders/:id/edit" element={<EditOrder />} />
            <Route path="/pending" element={<PendingPayments />} />
            <Route path="/delivery" element={<DeliveryTracking />} />
          </Routes>
        </main>

        {/* Floating Action Button */}
        <Link to="/orders/new" className="fab-btn" title="Add New Order">
          <Plus size={26} strokeWidth={2.5} />
        </Link>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
