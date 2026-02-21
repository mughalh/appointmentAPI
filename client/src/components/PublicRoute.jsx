import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
      }}>
        <div className="metro-tile" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📅</div>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  // Redirect to appropriate dashboard if already logged in
  if (user) {
    if (user.role === 'PROVIDER') {
      return <Navigate to="/provider/dashboard" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;