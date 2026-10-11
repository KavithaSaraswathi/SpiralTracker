import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Users, ListOrdered, Archive } from 'lucide-react';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/subjects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BookOpen size={20} />
        <span>Subjects</span>
      </NavLink>

      <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Users size={20} />
        <span>Students</span>
      </NavLink>

      <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <ListOrdered size={20} />
        <span>Orders</span>
      </NavLink>

      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Archive size={20} />
        <span>History</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
