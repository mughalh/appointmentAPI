import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
      }}>
        <motion.div 
          className="metro-tile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            padding: '40px',
            maxWidth: '400px'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', marginBottom: '20px' }}
          >
            📅
          </motion.div>
          <h2 style={{ marginBottom: '10px' }}>Loading your dashboard...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Please wait while we set things up</p>
          
          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '4px',
            background: 'var(--border)',
            borderRadius: '2px',
            marginTop: '20px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--primary)'
              }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, var(--error) 0%, #b91c1c 100%)'
        }}
      >
        <div className="metro-tile" style={{
          textAlign: 'center',
          padding: '40px',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
          <h2 style={{ marginBottom: '10px', color: 'var(--error)' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            You don't have permission to access this page.
            This area is restricted to {allowedRoles.join(' or ')} only.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn-primary"
            style={{ marginRight: '10px' }}
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-secondary"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    );
  }

  // Redirect based on role if trying to access wrong dashboard
  const path = location.pathname;
  
  // If customer tries to access provider routes
  if (user.role === 'CUSTOMER' && path.includes('/provider')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If provider tries to access customer dashboard root
  if (user.role === 'PROVIDER' && path === '/dashboard') {
    return <Navigate to="/provider/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;