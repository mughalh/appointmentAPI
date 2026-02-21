import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, FiLock, FiLogIn, FiEye, FiEyeOff,
  FiArrowRight, FiShield, FiCheckCircle, FiAlertCircle,
  FiSmartphone, FiShieldOff
} from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Load saved email if "remember me" was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate login attempt tracking
    setLoginAttempts(prev => prev + 1);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Show success message before redirect
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } else {
      setError(result.error || 'Invalid email or password');
      
      // Lock after 5 failed attempts
      if (loginAttempts >= 4) {
        setError('Too many failed attempts. Please try again in 15 minutes.');
      }
    }
    
    setLoading(false);
  };

  const handle2FASubmit = (e) => {
    e.preventDefault();
    // Handle 2FA verification
    if (twoFactorCode.length === 6) {
      setShow2FA(false);
      // Proceed with login
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: i % 2 === 0 ? '400px' : '300px',
              height: i % 2 === 0 ? '400px' : '300px',
              borderRadius: '50%',
              background: `rgba(255,255,255,${0.03})`,
              left: `${(i * 23) % 100}%`,
              top: `${(i * 17) % 100}%`,
              filter: 'blur(60px)'
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 15 + i,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '450px',
          width: '100%',
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(10px)',
          borderRadius: '32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Decorative Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 30px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Circles */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.1)'
            }}
          />
          
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              bottom: '-100px',
              left: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid rgba(255,255,255,0.05)'
            }}
          />

          {/* Logo/Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: '70px',
              height: '70px',
              background: 'white',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              position: 'relative',
              zIndex: 2
            }}
          >
            <FiLock size={35} color="#667eea" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: '36px',
              fontWeight: '800',
              color: 'white',
              marginBottom: '8px',
              position: 'relative',
              zIndex: 2
            }}
          >
            Welcome Back
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.9)',
              position: 'relative',
              zIndex: 2
            }}
          >
            Sign in to continue to your dashboard
          </motion.p>

          {/* Device Indicators */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255,255,255,0.2)',
              padding: '5px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'white'
            }}>
              <FiSmartphone size={12} /> Secure
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255,255,255,0.2)',
              padding: '5px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'white'
            }}>
              <FiSmartphone size={12} /> Encrypted
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div style={{ padding: '30px' }}>
          {/* Error Message with Animation */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                style={{
                  background: 'rgba(232,17,35,0.1)',
                  color: '#e81123',
                  padding: '15px',
                  borderRadius: '16px',
                  marginBottom: '20px',
                  border: '1px solid rgba(232,17,35,0.2)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <FiAlertCircle size={20} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
              >
                {/* Email Field */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    <FiMail style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      style={{
                        width: '100%',
                        padding: '14px 14px 14px 45px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '16px',
                        fontSize: '15px',
                        transition: 'all 0.3s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <FiMail style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#667eea'
                    }} />
                    
                    {/* Email validation indicator */}
                    {formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                      <FiCheckCircle style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#00b294'
                      }} />
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    <FiLock style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      style={{
                        width: '100%',
                        padding: '14px 45px 14px 45px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '16px',
                        fontSize: '15px',
                        transition: 'all 0.3s',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <FiLock style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#667eea'
                    }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#667eea'
                      }}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '25px'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#667eea'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>Remember me</span>
                  </label>

                  <Link
                    to="/forgot-password"
                    style={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                    onMouseLeave={(e) => e.target.style.color = '#667eea'}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    boxShadow: '0 10px 20px rgba(102,126,234,0.3)'
                  }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <FiLogIn size={20} />
                      Sign In
                    </>
                  )}
                </motion.button>

                {/* Security Notice */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  padding: '10px',
                  background: '#f5f5f5',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <FiShield color="#667eea" />
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    Your connection is secure and encrypted
                  </span>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="2fa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handle2FASubmit}
              >
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 15px'
                  }}>
                    <FiShield size={30} color="white" />
                  </div>
                  <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>Two-Factor Authentication</h3>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="text"
                    maxLength="6"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '16px',
                      fontSize: '24px',
                      textAlign: 'center',
                      letterSpacing: '8px',
                      fontWeight: 'bold',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={twoFactorCode.length !== 6}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '16px',
                    border: 'none',
                    background: twoFactorCode.length === 6 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ccc',
                    color: 'white',
                    cursor: twoFactorCode.length === 6 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s',
                    marginBottom: '10px'
                  }}
                >
                  Verify Code
                </button>

                <button
                  type="button"
                  onClick={() => setShow2FA(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Back to login
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Sign Up Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '16px'
          }}>
            <p style={{ color: '#666', marginBottom: '0' }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#764ba2';
                  e.target.style.gap = '8px';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#667eea';
                  e.target.style.gap = '5px';
                }}
              >
                Create an account <FiArrowRight />
              </Link>
            </p>
          </div>

          {/* Trust Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginTop: '20px',
            fontSize: '12px',
            color: '#999'
          }}>
            <span>🔒 256-bit SSL</span>
            <span>⚡ Instant Access</span>
            <span>🛡️ GDPR Compliant</span>
          </div>
        </div>
      </motion.div>

      {/* Floating Help Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'white',
          border: 'none',
          boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 20
        }}
        onClick={() => window.location.href = '/help'}
      >
        ?
      </motion.button>
    </div>
  );
};

export default Login;