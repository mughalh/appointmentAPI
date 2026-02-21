import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FiCalendar, FiClock, FiUser, FiBriefcase, 
  FiCheckCircle, FiXCircle, FiTrendingUp, FiStar,
  FiDollarSign, FiPieChart, FiSettings, FiBell,
  FiMoreVertical, FiEdit2, FiTrash2, FiCheck,
  FiRefreshCw, FiFilter, FiDownload
} from 'react-icons/fi';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('today'); // today, week, month
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      // Fetch employee profile
      const employeeRes = await axios.get('http://localhost:5000/api/employees/my-profile');
      setEmployeeData(employeeRes.data);

      // Fetch appointments
      const appointmentsRes = await axios.get('http://localhost:5000/api/appointments/provider');
      const allAppointments = appointmentsRes.data;
      setAppointments(allAppointments);

      // Fetch services offered by this provider
      const servicesRes = await axios.get('http://localhost:5000/api/employees/my-services');
      setServices(servicesRes.data);

      // Fetch notifications
      const notificationsRes = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(notificationsRes.data);

      // Calculate stats
      calculateStats(allAppointments);
      
      // Filter today's appointments
      const today = new Date();
      const todayApps = allAppointments.filter(apt => 
        isSameDay(parseISO(apt.startTime), today) && 
        apt.status !== 'CANCELLED'
      );
      setTodayAppointments(todayApps);

      // Filter upcoming appointments (excluding today)
      const upcoming = allAppointments.filter(apt => {
        const aptDate = parseISO(apt.startTime);
        return aptDate > today && apt.status === 'BOOKED';
      }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setUpcomingAppointments(upcoming.slice(0, 5));

      // Generate weekly schedule
      generateWeeklySchedule(allAppointments);

    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments) => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const stats = appointments.reduce((acc, apt) => {
      const aptDate = new Date(apt.startTime);
      const isToday = aptDate.toDateString() === todayStr;
      
      // Count by status
      if (apt.status === 'BOOKED' || apt.status === 'CONFIRMED') {
        acc.pendingAppointments++;
        if (isToday) acc.todayAppointments++;
      } else if (apt.status === 'COMPLETED') {
        acc.completedAppointments++;
        acc.totalRevenue += apt.service?.price || 0;
      } else if (apt.status === 'CANCELLED') {
        acc.cancelledAppointments++;
      }
      
      acc.totalAppointments++;
      return acc;
    }, {
      totalAppointments: 0,
      todayAppointments: 0,
      pendingAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      totalRevenue: 0
    });

    // Mock rating (would come from reviews in real app)
    stats.averageRating = 4.8;
    stats.totalReviews = 156;

    setStats(stats);
  };

  const generateWeeklySchedule = (appointments) => {
    const start = startOfWeek(selectedDate);
    const end = endOfWeek(selectedDate);
    const days = eachDayOfInterval({ start, end });

    const schedule = days.map(day => {
      const dayApps = appointments.filter(apt => 
        isSameDay(parseISO(apt.startTime), day) &&
        apt.status !== 'CANCELLED'
      );
      
      return {
        date: day,
        appointments: dayApps,
        count: dayApps.length,
        isToday: isSameDay(day, new Date())
      };
    });

    setWeeklySchedule(schedule);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
        status: newStatus
      });
      
      // Refresh data
      fetchProviderData();
      
      // Show success notification
      alert(`Appointment ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleMarkCompleted = (appointmentId) => {
    if (window.confirm('Mark this appointment as completed?')) {
      handleStatusChange(appointmentId, 'COMPLETED');
    }
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      handleStatusChange(appointmentId, 'CANCELLED');
    }
  };

  const handleConfirmAppointment = (appointmentId) => {
    handleStatusChange(appointmentId, 'CONFIRMED');
  };

  const quickActions = [
    {
      title: 'View Schedule',
      icon: <FiCalendar size={24} />,
      color: 'blue',
      onClick: () => setViewMode('week'),
      description: 'Manage your weekly schedule'
    },
    {
      title: 'Manage Services',
      icon: <FiBriefcase size={24} />,
      color: 'green',
      onClick: () => navigate('/services'),
      description: 'Update your service offerings'
    },
    {
      title: 'Set Availability',
      icon: <FiClock size={24} />,
      color: 'purple',
      onClick: () => setShowSettings(true),
      description: 'Configure working hours'
    },
    {
      title: 'View Reports',
      icon: <FiPieChart size={24} />,
      color: 'orange',
      onClick: () => navigate('/reports'),
      description: 'Analytics and insights'
    }
  ];

  const statsCards = [
    {
      title: 'Today\'s Appointments',
      value: stats.todayAppointments,
      icon: <FiCalendar />,
      color: 'blue',
      trend: `${stats.pendingAppointments} pending total`
    },
    {
      title: 'Completed',
      value: stats.completedAppointments,
      icon: <FiCheckCircle />,
      color: 'green',
      trend: `This month`
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue}`,
      icon: <FiDollarSign />,
      color: 'purple',
      trend: 'Last 30 days'
    },
    {
      title: 'Rating',
      value: `${stats.averageRating} ⭐`,
      icon: <FiStar />,
      color: 'orange',
      trend: `${stats.totalReviews} reviews`
    }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div className="metro-tile" style={{ textAlign: 'center', padding: '40px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', marginBottom: '20px' }}
          >
            📅
          </motion.div>
          <h3>Loading your dashboard...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="header-section"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
            Welcome back, {employeeData?.user?.fullName || user?.fullName}! 👋
          </h1>
          <p style={{ opacity: 0.9 }}>
            {employeeData?.specialization} • {employeeData?.experience}+ years experience
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <FiBell size={20} />
              {notifications.filter(n => n.status === 'PENDING').length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'var(--error)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notifications.filter(n => n.status === 'PENDING').length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '300px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    padding: '15px',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    Notifications
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif._id} style={{
                          padding: '12px',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer'
                        }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{notif.title}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No new notifications
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <FiSettings size={20} />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="metro-grid" style={{ marginBottom: '30px' }}>
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            className={`metro-tile colored ${stat.color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  {stat.title}
                </p>
                <h2 style={{ fontSize: '32px', marginBottom: '4px' }}>
                  {stat.value}
                </h2>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>
                  {stat.trend}
                </p>
              </div>
              <div style={{ fontSize: '40px' }}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Quick Actions</h2>
      <div className="metro-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '30px' }}>
        {quickActions.map((action, index) => (
          <motion.div
            key={index}
            className={`metro-tile colored ${action.color}`}
            onClick={action.onClick}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            style={{ cursor: 'pointer', minHeight: '120px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ fontSize: '32px' }}>
                {action.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>
                  {action.title}
                </h3>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>
                  {action.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px',
        marginBottom: '30px'
      }}>
        {/* Today's Schedule */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '24px' }}>Today's Schedule</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                <FiRefreshCw /> Refresh
              </button>
              <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                <FiFilter /> Filter
              </button>
            </div>
          </div>

          <div className="metro-tile" style={{ padding: '20px' }}>
            {todayAppointments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {todayAppointments.map((apt, index) => (
                  <motion.div
                    key={apt._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      padding: '15px',
                      background: 'var(--background)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {format(parseISO(apt.startTime), 'h:mm a')}
                          </span>
                          <span style={{
                            background: apt.status === 'BOOKED' ? 'var(--warning)' :
                                      apt.status === 'CONFIRMED' ? 'var(--success)' :
                                      apt.status === 'COMPLETED' ? 'var(--primary)' : 'var(--error)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {apt.status}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>
                          {apt.customer?.fullName}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          {apt.service?.name} • ${apt.service?.price}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {apt.status === 'BOOKED' && (
                          <>
                            <button
                              onClick={() => handleConfirmAppointment(apt._id)}
                              className="btn btn-primary"
                              style={{ padding: '8px' }}
                              title="Confirm"
                            >
                              <FiCheck />
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(apt._id)}
                              className="btn btn-secondary"
                              style={{ padding: '8px', background: 'var(--error)', color: 'white' }}
                              title="Cancel"
                            >
                              <FiXCircle />
                            </button>
                          </>
                        )}
                        {apt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleMarkCompleted(apt._id)}
                            className="btn btn-primary"
                            style={{ padding: '8px' }}
                            title="Mark Completed"
                          >
                            <FiCheckCircle />
                          </button>
                        )}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '8px' }}
                          title="More options"
                        >
                          <FiMoreVertical />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <FiCalendar size={48} style={{ color: 'var(--text-secondary)', marginBottom: '15px' }} />
                <h3>No appointments today</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Enjoy your free time! Check your schedule for upcoming appointments.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments & Performance */}
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Upcoming</h2>
          <div className="metro-tile" style={{ padding: '20px', marginBottom: '20px' }}>
            {upcomingAppointments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {upcomingAppointments.map((apt, index) => (
                  <div key={apt._id} style={{
                    padding: '12px',
                    borderBottom: index < upcomingAppointments.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <p style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '4px' }}>
                      {format(parseISO(apt.startTime), 'EEE, MMM d • h:mm a')}
                    </p>
                    <p style={{ fontWeight: 'bold' }}>{apt.customer?.fullName}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {apt.service?.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                No upcoming appointments
              </p>
            )}
          </div>

          {/* Performance Chart (Mock) */}
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Weekly Performance</h2>
          <div className="metro-tile" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={day} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '30px',
                    height: '100px',
                    background: 'var(--background)',
                    borderRadius: '4px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${Math.random() * 80 + 20}%`,
                      background: 'var(--primary)',
                      borderRadius: '4px',
                      transition: 'height 0.3s'
                    }} />
                  </div>
                  <span style={{ fontSize: '12px' }}>{day}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>This Week</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>24</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Last Week</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>21</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Growth</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)' }}>+14%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule View */}
      {viewMode === 'week' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '30px' }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Weekly Schedule</h2>
          <div className="metro-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {weeklySchedule.map((day, index) => (
              <motion.div
                key={index}
                className={`metro-tile ${day.isToday ? 'colored blue' : ''}`}
                whileHover={{ scale: 1.02 }}
                style={{
                  minHeight: '200px',
                  cursor: 'pointer',
                  background: day.isToday ? '' : 'white'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {format(day.date, 'EEE')}
                  </span>
                  <span style={{
                    background: day.isToday ? 'white' : 'var(--primary)',
                    color: day.isToday ? 'var(--primary)' : 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    {format(day.date, 'd')}
                  </span>
                </div>
                
                <div>
                  {day.appointments.slice(0, 3).map(apt => (
                    <div key={apt._id} style={{
                      fontSize: '12px',
                      padding: '4px',
                      marginBottom: '4px',
                      background: 'rgba(0,120,212,0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {format(parseISO(apt.startTime), 'h:mm')} - {apt.customer?.fullName}
                    </div>
                  ))}
                  {day.appointments.length > 3 && (
                    <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px' }}>
                      +{day.appointments.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Services Offered */}
      <div style={{ marginTop: '30px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '24px' }}>Your Services</h2>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/services/add')}
          >
            Add New Service
          </button>
        </div>

        <div className="metro-grid">
          {services.map((service, index) => (
            <motion.div
              key={service._id}
              className="metro-tile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '18px' }}>{service.name}</h3>
                <div>
                  <FiEdit2 style={{ marginRight: '10px', cursor: 'pointer', color: 'var(--primary)' }} />
                  <FiTrash2 style={{ cursor: 'pointer', color: 'var(--error)' }} />
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '10px' }}>
                {service.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${service.price}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {service.durationMinutes} min
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;