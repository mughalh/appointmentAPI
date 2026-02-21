import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FiCalendar, FiClock, FiUser, FiBriefcase, 
  FiCheckCircle, FiXCircle, FiTrendingUp, FiStar,
  FiArrowRight, FiBell, FiDollarSign, FiHeart,
  FiMapPin, FiShoppingBag, FiAward, FiActivity
} from 'react-icons/fi';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recommendedServices, setRecommendedServices] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    setGreeting(getGreeting());
    
    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };


const fetchDashboardData = async () => {
  try {
    // Fetch appointments
    const appointmentsRes = await axios.get('http://localhost:5000/api/appointments/my-appointments');
    const appointments = appointmentsRes.data.appointments || appointmentsRes.data || [];
    
    // Fetch stats
    let statsData = { totalSpent: 0, loyaltyPoints: 0 };
    try {
      const statsRes = await axios.get('http://localhost:5000/api/users/stats');
      statsData = statsRes.data.data || statsRes.data;
    } catch (statsError) {
      console.log('Stats endpoint not available yet, using defaults');
    }

    // Fetch recommendations
    let recommendations = [];
    try {
      const recommendationsRes = await axios.get('http://localhost:5000/api/services/popular');
      recommendations = recommendationsRes.data.services || recommendationsRes.data || [];
    } catch (recError) {
      console.log('Recommendations endpoint not available yet');
    }
    
    // Calculate stats
    const now = new Date();
    const upcoming = appointments.filter(apt => 
      apt && new Date(apt.startTime) > now && ['BOOKED', 'CONFIRMED'].includes(apt.status)
    );
    
    // Get next 3 upcoming appointments
    const nextUpcoming = upcoming
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 3);
    
    setStats({
      totalAppointments: appointments.length,
      upcomingAppointments: upcoming.length,
      completedAppointments: appointments.filter(apt => apt && apt.status === 'COMPLETED').length,
      cancelledAppointments: appointments.filter(apt => apt && apt.status === 'CANCELLED').length,
      totalSpent: statsData.totalSpent || 0,
      loyaltyPoints: statsData.loyaltyPoints || 0
    });

    setRecentAppointments(appointments.slice(0, 5));
    setUpcomingAppointments(nextUpcoming);
    setRecommendedServices(recommendations);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

  const quickActions = [
    {
      title: 'Book Appointment',
      icon: <FiCalendar size={28} />,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      onClick: () => navigate('/book'),
      description: 'Schedule a new appointment',
      badge: 'New'
    },
    {
      title: 'My Appointments',
      icon: <FiClock size={28} />,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      onClick: () => navigate('/appointments'),
      description: 'View your schedule',
      badge: upcomingAppointments.length
    },
    {
      title: 'Browse Services',
      icon: <FiBriefcase size={28} />,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      onClick: () => navigate('/services'),
      description: 'Explore offerings',
      badge: '50+'
    },
    {
      title: 'My Profile',
      icon: <FiUser size={28} />,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      onClick: () => navigate('/profile'),
      description: 'Update your info',
      badge: null
    }
  ];

  const statsCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: <FiCalendar size={24} />,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)',
      trend: '+12% from last month'
    },
    {
      title: 'Upcoming',
      value: stats.upcomingAppointments,
      icon: <FiClock size={24} />,
      color: '#f093fb',
      bgColor: 'rgba(240, 147, 251, 0.1)',
      trend: stats.upcomingAppointments > 0 ? 'Next: Today' : 'No upcoming'
    },
    {
      title: 'Completed',
      value: stats.completedAppointments,
      icon: <FiCheckCircle size={24} />,
      color: '#4facfe',
      bgColor: 'rgba(79, 172, 254, 0.1)',
      trend: `${Math.round((stats.completedAppointments / (stats.totalAppointments || 1)) * 100)}% success rate`
    },
    {
      title: 'Points Earned',
      value: stats.loyaltyPoints,
      icon: <FiAward size={24} />,
      color: '#43e97b',
      bgColor: 'rgba(67, 233, 123, 0.1)',
      trend: 'Redeem for rewards'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '3px solid #667eea',
            borderTopColor: 'transparent'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Animated Welcome Banner */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '30px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
            }}
          >
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}
              >
                {greeting}, {user?.fullName?.split(' ')[0]}! 👋
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                style={{ opacity: 0.9 }}
              >
                {stats.upcomingAppointments > 0 
                  ? `You have ${stats.upcomingAppointments} upcoming appointment${stats.upcomingAppointments > 1 ? 's' : ''}. Have a great day!` 
                  : 'Ready to book your next appointment? Check out our recommended services below.'}
              </motion.p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <FiBell size={32} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color
              }}>
                {stat.icon}
              </div>
              <span style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: stat.color
              }}>
                {stat.value}
              </span>
            </div>
            <h3 style={{ fontSize: '16px', color: '#666', marginBottom: '4px' }}>{stat.title}</h3>
            <p style={{ fontSize: '13px', color: '#999' }}>{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Quick Actions */}
        <div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiActivity /> Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={action.onClick}
                style={{
                  background: action.color,
                  borderRadius: '20px',
                  padding: '24px',
                  cursor: 'pointer',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                }}
              >
                {/* Decorative circles */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)'
                }} />

                {/* Badge */}
                {action.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255,255,255,0.3)',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(5px)'
                  }}>
                    {action.badge}
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>{action.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{action.title}</h3>
                <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '16px' }}>{action.description}</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Get started <FiArrowRight />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiClock /> Upcoming Appointments
          </h2>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            {upcomingAppointments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {upcomingAppointments.map((apt, index) => (
                  <motion.div
                    key={apt._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    onClick={() => navigate(`/appointments/${apt._id}`)}
                    style={{
                      padding: '16px',
                      background: '#f8f9fa',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {apt.service?.name}
                      </span>
                      <span style={{
                        color: apt.status === 'BOOKED' ? '#f093fb' : '#4facfe',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {apt.status}
                      </span>
                    </div>
                    <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      with {apt.employee?.user?.fullName || 'Provider'}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock size={12} /> {formatDate(apt.startTime)}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(102, 126, 234, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <FiCalendar size={32} color="#667eea" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No upcoming appointments</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Ready to book your next appointment?
                </p>
                <button
                  onClick={() => navigate('/book')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  Book Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Services */}
      {recommendedServices.length > 0 && (
        <div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiStar style={{ color: '#f093fb' }} /> Recommended for You
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {recommendedServices.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }}
                onClick={() => navigate(`/book?service=${service._id}`)}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Popular badge */}
                {index === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    Most Popular
                  </div>
                )}

                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {service.name}
                </h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                  {service.description?.substring(0, 80)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                      ${service.price}
                    </span>
                    <span style={{ fontSize: '13px', color: '#999', marginLeft: '4px' }}>
                      / {service.durationMinutes} min
                    </span>
                  </div>
                  <button
                    style={{
                      background: 'none',
                      border: '2px solid #667eea',
                      color: '#667eea',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#667eea';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                      e.target.style.color = '#667eea';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/book?service=${service._id}`);
                    }}
                  >
                    Book
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentAppointments.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiTrendingUp /> Recent Activity
          </h2>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            {recentAppointments.map((apt, index) => (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom: index < recentAppointments.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: apt.status === 'COMPLETED' ? 'rgba(67, 233, 123, 0.1)' :
                              apt.status === 'CANCELLED' ? 'rgba(245, 87, 108, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: apt.status === 'COMPLETED' ? '#43e97b' :
                          apt.status === 'CANCELLED' ? '#f5576c' : '#667eea'
                }}>
                  {apt.status === 'COMPLETED' ? <FiCheckCircle /> :
                   apt.status === 'CANCELLED' ? <FiXCircle /> : <FiClock />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {apt.service?.name || 'Appointment'} with {apt.employee?.user?.fullName || 'Provider'}
                  </p>
                  <p style={{ fontSize: '13px', color: '#666' }}>
                    {new Date(apt.startTime).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: apt.status === 'COMPLETED' ? '#43e97b' :
                              apt.status === 'CANCELLED' ? '#f5576c' : '#667eea',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {apt.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;