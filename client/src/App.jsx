import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Layout from './components/Layout';

// Public Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';

// Private Pages
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookAppointment from './pages/BookAppointment';  // Single import
import MyAppointments from './pages/MyAppointments';
import Services from './pages/Services';
import Employees from './pages/Employees';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              {/* Customer Routes */}
              <Route path="/dashboard" element={
                <RoleBasedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </RoleBasedRoute>
              } />
              
              <Route path="/book" element={
                <RoleBasedRoute allowedRoles={['CUSTOMER']}>
                  <BookAppointment />
                </RoleBasedRoute>
              } />
              
              {/* Provider Routes */}
              <Route path="/provider/dashboard" element={
                <RoleBasedRoute allowedRoles={['PROVIDER']} fallbackPath="/dashboard">
                  <ProviderDashboard />
                </RoleBasedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <RoleBasedRoute allowedRoles={['ADMIN']} fallbackPath="/dashboard">
                  <AdminDashboard />
                </RoleBasedRoute>
              } />
              
              {/* Shared Routes */}
              <Route path="/appointments" element={
                <RoleBasedRoute allowedRoles={['CUSTOMER', 'PROVIDER']}>
                  <MyAppointments />
                </RoleBasedRoute>
              } />
              
              <Route path="/services" element={
                <RoleBasedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
                  <Services />
                </RoleBasedRoute>
              } />
              
              <Route path="/employees" element={
                <RoleBasedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                  <Employees />
                </RoleBasedRoute>
              } />
              
              <Route path="/profile" element={
                <RoleBasedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
                  <Profile />
                </RoleBasedRoute>
              } />
            </Route>
          </Route>

          {/* Catch all - 404 */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <div className="metro-tile" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>404</div>
                <h2 style={{ marginBottom: '10px' }}>Page Not Found</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  The page you're looking for doesn't exist.
                </p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="btn btn-primary"
                >
                  Go Home
                </button>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;