import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="app-header">
      <Link to="/" className="brand-title">
        <span className="brand-icon">📚</span>
        <span>SpiralTrack</span>
      </Link>
      <div className="header-actions">
        <Link to="/orders/new" className="btn btn-sm btn-primary">
          + New Order
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
