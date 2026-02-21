import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiHome, FiCalendar, FiUsers, FiBriefcase, FiUser, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
      { path: '/appointments', label: 'Appointments', icon: <FiCalendar /> },
      { path: '/services', label: 'Services', icon: <FiBriefcase /> },
    ];

    if (user?.role === 'PROVIDER' || user?.role === 'ADMIN') {
      baseItems.push({ path: '/employees', label: 'Employees', icon: <FiUsers /> });
    }

    baseItems.push({ path: '/profile', label: 'Profile', icon: <FiUser /> });

    return baseItems;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          📅 AppointMaster
        </div>

        {/* Desktop Menu */}
        <div className="nav-menu desktop-menu">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: '20px' }}>
            <FiLogOut style={{ marginRight: '8px' }} />
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              display: 'none',
              position: 'fixed',
              top: '60px',
              left: 0,
              right: 0,
              background: 'var(--surface)',
              padding: '20px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 999
            }}
          >
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="nav-item mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: 'block', padding: '12px', margin: '4px 0' }}
              >
                <span style={{ marginRight: '12px' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary mobile-logout"
              style={{ width: '100%', marginTop: '12px' }}
            >
              <FiLogOut style={{ marginRight: '8px' }} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="main-content" style={{ padding: '24px' }}>
        <Outlet />
      </main>

  
    </div>
  );
};

export default Layout;