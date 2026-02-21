import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiMail, FiLock, FiPhone, FiBriefcase, FiUserPlus,
  FiCheckCircle, FiEye, FiEyeOff, FiArrowRight, FiShield,
  FiStar, FiCalendar, FiClock, FiAward
} from 'react-icons/fi';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'CUSTOMER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    const password = formData.password;
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    if (password.match(/[$@#&!]+/)) strength += 25;
    
    setPasswordStrength(Math.min(strength, 100));
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (!acceptedTerms) {
      return setError('Please accept the terms and conditions');
    }

    setLoading(true);

    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return '#e81123';
    if (passwordStrength < 60) return '#ff8c00';
    if (passwordStrength < 80) return '#00b294';
    return '#107c10';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: <FiUser /> },
    { number: 2, title: 'Account Details', icon: <FiLock /> },
    { number: 3, title: 'Review', icon: <FiCheckCircle /> }
  ];

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
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: i % 2 === 0 ? '300px' : '200px',
              height: i % 2 === 0 ? '300px' : '200px',
              borderRadius: '50%',
              background: `rgba(255,255,255,${0.02})`,
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              filter: 'blur(50px)'
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '550px',
          width: '100%',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Header with Wave Design */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 30px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Circles */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }} />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            style={{
              width: '60px',
              height: '60px',
              background: 'white',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              position: 'relative',
              zIndex: 2
            }}
          >
            <FiUserPlus size={30} color="#667eea" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
              position: 'relative',
              zIndex: 2
            }}
          >
            Create Account
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
            Join thousands of businesses using AppointMaster
          </motion.p>

          {/* Progress Steps */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '30px',
            position: 'relative',
            zIndex: 2
          }}>
            {steps.map((step, index) => (
              <div
                key={step.number}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative'
                }}
              >
                {index > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '-50%',
                    width: '100%',
                    height: '2px',
                    background: currentStep > index ? 'white' : 'rgba(255,255,255,0.3)',
                    transition: 'background 0.3s'
                  }} />
                )}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: currentStep >= step.number ? 'white' : 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: currentStep >= step.number ? '#667eea' : 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => setCurrentStep(step.number)}
                >
                  {currentStep > step.number ? <FiCheckCircle /> : step.icon}
                </motion.div>
                <div style={{ marginLeft: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Step {step.number}</div>
                  <div style={{ fontSize: '14px', color: 'white', fontWeight: 'bold' }}>{step.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <div style={{ padding: '30px' }}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(232,17,35,0.1)',
                color: '#e81123',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center',
                border: '1px solid rgba(232,17,35,0.2)',
                fontSize: '14px'
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Full Name */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>
                      <FiUser style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        style={{
                          width: '100%',
                          padding: '14px 14px 14px 45px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '12px',
                          fontSize: '15px',
                          transition: 'all 0.3s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                      <FiUser style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#667eea'
                      }} />
                    </div>
                  </div>

                  {/* Email */}
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
                          borderRadius: '12px',
                          fontSize: '15px',
                          transition: 'all 0.3s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                      <FiMail style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#667eea'
                      }} />
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>
                      <FiPhone style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your phone number"
                        style={{
                          width: '100%',
                          padding: '14px 14px 14px 45px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '12px',
                          fontSize: '15px',
                          transition: 'all 0.3s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                      <FiPhone style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#667eea'
                      }} />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>
                      <FiBriefcase style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      I want to
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px'
                    }}>
                      {['CUSTOMER', 'PROVIDER'].map((role) => (
                        <motion.div
                          key={role}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, role })}
                          style={{
                            padding: '15px',
                            border: `2px solid ${formData.role === role ? '#667eea' : '#e0e0e0'}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            background: formData.role === role ? 'rgba(102,126,234,0.1)' : 'white',
                            transition: 'all 0.3s'
                          }}
                        >
                          <div style={{
                            fontSize: '24px',
                            marginBottom: '8px',
                            color: formData.role === role ? '#667eea' : '#999'
                          }}>
                            {role === 'CUSTOMER' ? '👤' : '💼'}
                          </div>
                          <div style={{
                            fontWeight: 'bold',
                            color: formData.role === role ? '#667eea' : '#666'
                          }}>
                            {role === 'CUSTOMER' ? 'Customer' : 'Provider'}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: formData.role === role ? '#667eea' : '#999',
                            marginTop: '4px'
                          }}>
                            {role === 'CUSTOMER' ? 'Book appointments' : 'Offer services'}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Password */}
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
                        placeholder="Create a password"
                        style={{
                          width: '100%',
                          padding: '14px 45px 14px 45px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '12px',
                          fontSize: '15px',
                          transition: 'all 0.3s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
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
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    
                    {/* Password Strength Meter */}
                    {formData.password && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '10px' }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '5px'
                        }}>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            Password strength:
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: getPasswordStrengthColor()
                          }}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          background: '#e0e0e0',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength}%` }}
                            transition={{ duration: 0.3 }}
                            style={{
                              height: '100%',
                              background: getPasswordStrengthColor()
                            }}
                          />
                        </div>
                        <ul style={{
                          marginTop: '10px',
                          fontSize: '11px',
                          color: '#666',
                          listStyle: 'none',
                          padding: 0,
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '5px'
                        }}>
                          <li style={{ color: formData.password.length >= 8 ? '#00b294' : '#999' }}>
                            ✓ 8+ characters
                          </li>
                          <li style={{ color: /[a-z]/.test(formData.password) ? '#00b294' : '#999' }}>
                            ✓ Lowercase letter
                          </li>
                          <li style={{ color: /[A-Z]/.test(formData.password) ? '#00b294' : '#999' }}>
                            ✓ Uppercase letter
                          </li>
                          <li style={{ color: /[0-9]/.test(formData.password) ? '#00b294' : '#999' }}>
                            ✓ Number
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#333',
                      fontSize: '14px'
                    }}>
                      <FiLock style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm your password"
                        style={{
                          width: '100%',
                          padding: '14px 45px 14px 45px',
                          border: `2px solid ${
                            formData.confirmPassword && formData.password !== formData.confirmPassword
                              ? '#e81123'
                              : formData.confirmPassword && formData.password === formData.confirmPassword
                              ? '#00b294'
                              : '#e0e0e0'
                          }`,
                          borderRadius: '12px',
                          fontSize: '15px',
                          transition: 'all 0.3s',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          fontSize: '12px',
                          color: '#e81123',
                          marginTop: '5px'
                        }}
                      >
                        Passwords do not match
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '30px',
                    borderRadius: '16px',
                    color: 'white',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Account Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiUser />
                        <span>{formData.fullName || 'Not provided'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiMail />
                        <span>{formData.email || 'Not provided'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiPhone />
                        <span>{formData.phone || 'Not provided'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiBriefcase />
                        <span>{formData.role === 'CUSTOMER' ? 'Customer' : 'Service Provider'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    padding: '15px',
                    background: '#f5f5f5',
                    borderRadius: '12px'
                  }}>
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      I agree to the{' '}
                      <Link to="/terms" style={{ color: '#667eea', textDecoration: 'none' }}>
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" style={{ color: '#667eea', textDecoration: 'none' }}>
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px'
            }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="btn btn-secondary"
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '16px',
                    borderRadius: '12px',
                    border: '2px solid #667eea',
                    background: 'white',
                    color: '#667eea',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  Back
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Next <FiArrowRight />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !acceptedTerms}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #00b294 0%, #008272 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: loading || !acceptedTerms ? 'not-allowed' : 'pointer',
                    opacity: loading || !acceptedTerms ? 0.7 : 1,
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? 'Creating Account...' : (
                    <>
                      <FiUserPlus /> Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Social Proof */}
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}>
              <FiShield /> Trusted by 10,000+ businesses
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              fontSize: '12px',
              color: '#999'
            }}>
              <span>⚡ Free 14-day trial</span>
              <span>💳 No credit card required</span>
              <span>🔒 256-bit SSL</span>
            </div>
          </div>

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;