import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FiCalendar, FiClock, FiUser, FiBriefcase, 
  FiCheckCircle, FiXCircle, FiAlertCircle, FiStar,
  FiMapPin, FiPhone, FiMail, FiMessageSquare,
  FiChevronLeft, FiChevronRight, FiFilter, FiSearch,
  FiDownload, FiRefreshCw, FiEye, FiEdit2, FiTrash2,
  FiPlus, FiCreditCard, FiBell, FiSettings
} from 'react-icons/fi';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addDays, subDays } from 'date-fns';

const MyAppointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list, calendar
  
  // Calendar view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    fetchAppointments();
    
    // Check for booking success message from navigation state
    if (location.state?.bookingSuccess) {
      alert('Appointment booked successfully!');
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeFilter, searchTerm, dateRange, statusFilter]);

  useEffect(() => {
    generateWeekDays();
  }, [currentDate]);

  const generateWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    setWeekDays(days);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'PROVIDER' 
        ? 'http://localhost:5000/api/appointments/provider'
        : 'http://localhost:5000/api/appointments/my-appointments';
      
      const response = await axios.get(endpoint);
      
      // Handle different response formats
      let appointmentsData = [];
      
      if (Array.isArray(response.data)) {
        // If response is directly an array
        appointmentsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // If response is { data: [...] }
        appointmentsData = response.data.data;
      } else if (response.data.appointments && Array.isArray(response.data.appointments)) {
        // If response is { appointments: [...] }
        appointmentsData = response.data.appointments;
      } else if (response.data.success && response.data.appointments) {
        // If response is { success: true, appointments: [...] }
        appointmentsData = response.data.appointments;
      }
      
      console.log('Appointments data:', appointmentsData); // Debug log
      
      setAppointments(appointmentsData);
      setFilteredAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Set empty arrays on error
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    // Safety check - ensure appointments is an array
    if (!Array.isArray(appointments)) {
      console.warn('Appointments is not an array:', appointments);
      setFilteredAppointments([]);
      return;
    }
    
    let filtered = [...appointments];

    // Filter by status/type
    const now = new Date();
    switch(activeFilter) {
      case 'upcoming':
        filtered = filtered.filter(apt => 
          apt && new Date(apt.startTime) > now && 
          ['BOOKED', 'CONFIRMED'].includes(apt.status)
        );
        break;
      case 'past':
        filtered = filtered.filter(apt => 
          apt && (new Date(apt.startTime) < now || 
          ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(apt.status))
        );
        break;
      case 'cancelled':
        filtered = filtered.filter(apt => apt && apt.status === 'CANCELLED');
        break;
      case 'completed':
        filtered = filtered.filter(apt => apt && apt.status === 'COMPLETED');
        break;
      default:
        break;
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt && (
          (user?.role === 'PROVIDER' 
            ? apt.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
            : apt.employee?.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let range;
      
      if (dateRange === 'today') {
        const today = new Date();
        range = { 
          start: new Date(today.setHours(0, 0, 0, 0)), 
          end: new Date(today.setHours(23, 59, 59, 999)) 
        };
      } else if (dateRange === 'week') {
        range = { 
          start: subDays(new Date(), 7), 
          end: new Date() 
        };
      } else if (dateRange === 'month') {
        range = { 
          start: subDays(new Date(), 30), 
          end: new Date() 
        };
      }
      
      if (range) {
        filtered = filtered.filter(apt => 
          apt && new Date(apt.startTime) >= range.start && new Date(apt.startTime) <= range.end
        );
      }
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt && apt.status === statusFilter);
    }

    // Sort by date (most recent first for upcoming, oldest first for past)
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      if (activeFilter === 'past') {
        return new Date(b.startTime) - new Date(a.startTime);
      }
      return new Date(a.startTime) - new Date(b.startTime);
    });

    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/appointments/${selectedAppointment._id}/cancel`, {
        reason: cancellationReason
      });
      
      setShowCancelModal(false);
      setCancellationReason('');
      fetchAppointments();
      
      // Show success message
      alert('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  const handleReschedule = () => {
    setShowRescheduleModal(false);
    navigate(`/book?reschedule=${selectedAppointment._id}`);
  };

  const handleReview = async () => {
    try {
      await axios.post(`http://localhost:5000/api/reviews`, {
        appointmentId: selectedAppointment._id,
        ...reviewData
      });
      
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '' });
      alert('Review submitted successfully! Thank you for your feedback.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'BOOKED': return 'var(--warning)';
      case 'CONFIRMED': return 'var(--success)';
      case 'COMPLETED': return 'var(--primary)';
      case 'CANCELLED': return 'var(--error)';
      case 'NO_SHOW': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'BOOKED': return <FiClock />;
      case 'CONFIRMED': return <FiCheckCircle />;
      case 'COMPLETED': return <FiCheckCircle />;
      case 'CANCELLED': return <FiXCircle />;
      case 'NO_SHOW': return <FiAlertCircle />;
      default: return <FiCalendar />;
    }
  };

  const getAppointmentsForDay = (date) => {
    if (!Array.isArray(appointments)) return [];
    return appointments.filter(apt => 
      apt && isSameDay(parseISO(apt.startTime), date) &&
      apt.status !== 'CANCELLED'
    );
  };

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
          <h3>Loading your appointments...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="my-appointments">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
            {user?.role === 'PROVIDER' ? 'Appointment Schedule' : 'My Appointments'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {user?.role === 'PROVIDER' 
              ? 'Manage your appointments and schedule'
              : 'View and manage your booked appointments'
            }
          </p>
        </div>
        
        {user?.role === 'CUSTOMER' && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/book')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 24px'
            }}
          >
            <FiPlus /> Book New Appointment
          </button>
        )}
      </motion.div>

      {/* View Toggle & Filters */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setViewMode('list')}
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Calendar View
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchAppointments}>
            <FiRefreshCw /> Refresh
          </button>
          <button className="btn btn-secondary">
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '10px',
        flexWrap: 'wrap'
      }}>
        {['upcoming', 'past', 'cancelled', 'completed', 'all'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeFilter === filter ? 'var(--primary)' : 'transparent',
              color: activeFilter === filter ? 'white' : 'var(--text-secondary)',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: activeFilter === filter ? 'bold' : 'normal',
              textTransform: 'capitalize'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
          <FiSearch style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)'
          }} />
          <input
            type="text"
            placeholder={user?.role === 'PROVIDER' 
              ? "Search by customer name or service..."
              : "Search by provider name or service..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            background: 'white',
            minWidth: '150px'
          }}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            background: 'white',
            minWidth: '150px'
          }}
        >
          <option value="all">All Status</option>
          <option value="BOOKED">Booked</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Content based on view mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredAppointments.length > 0 ? (
              <div className="metro-grid">
                {filteredAppointments.map((apt, index) => (
                  <motion.div
                    key={apt._id}
                    className="metro-tile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setShowDetailsModal(true);
                    }}
                  >
                    {/* Status Badge */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: getStatusColor(apt.status),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {getStatusIcon(apt.status)} {apt.status}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        #{apt._id.slice(-6)}
                      </span>
                    </div>

                    {/* Date & Time */}
                    <div style={{
                      background: 'var(--background)',
                      padding: '10px',
                      borderRadius: '8px',
                      marginBottom: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                        {format(parseISO(apt.startTime), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div style={{ fontSize: '16px', color: 'var(--primary)' }}>
                        {format(parseISO(apt.startTime), 'h:mm a')} - {format(parseISO(apt.endTime), 'h:mm a')}
                      </div>
                    </div>

                    {/* Service & Provider/Customer */}
                    <div style={{ marginBottom: '15px' }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>
                        {apt.service?.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {user?.role === 'PROVIDER' 
                            ? apt.customer?.fullName?.charAt(0)
                            : apt.employee?.user?.fullName?.charAt(0)
                          }
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold' }}>
                            {user?.role === 'PROVIDER' 
                              ? apt.customer?.fullName
                              : apt.employee?.user?.fullName
                            }
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {user?.role === 'PROVIDER' ? 'Customer' : 'Provider'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '15px'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        ${apt.service?.price}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="metro-tile" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <FiCalendar size={64} style={{ color: 'var(--text-secondary)', marginBottom: '20px' }} />
                <h2 style={{ marginBottom: '10px' }}>No appointments found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  {activeFilter === 'upcoming' 
                    ? "You don't have any upcoming appointments."
                    : activeFilter === 'past'
                    ? "No past appointments found."
                    : "No appointments match your filters."
                  }
                </p>
                {user?.role === 'CUSTOMER' && activeFilter === 'upcoming' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/book')}
                  >
                    Book Your First Appointment
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Calendar Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => setCurrentDate(subDays(currentDate, 7))}
                className="btn btn-secondary"
                style={{ padding: '10px' }}
              >
                <FiChevronLeft /> Previous Week
              </button>
              <h2>
                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
              </h2>
              <button
                onClick={() => setCurrentDate(addDays(currentDate, 7))}
                className="btn btn-secondary"
                style={{ padding: '10px' }}
              >
                Next Week <FiChevronRight />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="metro-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {weekDays.map((day, index) => {
                const dayAppointments = getAppointmentsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <motion.div
                    key={index}
                    className={`metro-tile ${isToday ? 'colored blue' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      minHeight: '200px',
                      padding: '15px',
                      background: isToday ? '' : 'white'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <span style={{ fontWeight: 'bold' }}>
                        {format(day, 'EEE')}
                      </span>
                      <span style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: isToday ? 'white' : 'var(--background)',
                        color: isToday ? 'var(--primary)' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {format(day, 'd')}
                      </span>
                    </div>

                    <div>
                      {dayAppointments.length > 0 ? (
                        dayAppointments.slice(0, 3).map(apt => (
                          <div
                            key={apt._id}
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setShowDetailsModal(true);
                            }}
                            style={{
                              padding: '6px',
                              marginBottom: '4px',
                              background: getStatusColor(apt.status),
                              color: 'white',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {format(parseISO(apt.startTime), 'h:mm')} - {
                              user?.role === 'PROVIDER' 
                                ? apt.customer?.fullName?.split(' ')[0]
                                : apt.service?.name
                            }
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                          No appointments
                        </p>
                      )}
                      
                      {dayAppointments.length > 3 && (
                        <p style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '5px' }}>
                          +{dayAppointments.length - 3} more
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="metro-tile"
              style={{ maxWidth: '600px', width: '100%', padding: '30px' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2>Appointment Details</h2>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: getStatusColor(selectedAppointment.status),
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {getStatusIcon(selectedAppointment.status)} {selectedAppointment.status}
                </span>
              </div>

              {/* Service Info */}
              <div style={{
                background: 'var(--background)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>
                  {selectedAppointment.service?.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
                  {selectedAppointment.service?.description}
                </p>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span style={{ fontSize: '14px' }}>
                    ⏱️ {selectedAppointment.service?.durationMinutes} minutes
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    ${selectedAppointment.service?.price}
                  </span>
                </div>
              </div>

              {/* Date & Time */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Date</p>
                  <p style={{ fontWeight: 'bold' }}>
                    {format(parseISO(selectedAppointment.startTime), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Time</p>
                  <p style={{ fontWeight: 'bold' }}>
                    {format(parseISO(selectedAppointment.startTime), 'h:mm a')} - {format(parseISO(selectedAppointment.endTime), 'h:mm a')}
                  </p>
                </div>
              </div>

              {/* People Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                {/* Customer/Provider based on role */}
                {user?.role === 'PROVIDER' ? (
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Customer</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {selectedAppointment.customer?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{selectedAppointment.customer?.fullName}</p>
                        <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span><FiMail /> {selectedAppointment.customer?.email}</span>
                          <span><FiPhone /> {selectedAppointment.customer?.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Provider</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--green)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {selectedAppointment.employee?.user?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{selectedAppointment.employee?.user?.fullName}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {selectedAppointment.employee?.specialization}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location (if applicable) */}
                <div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Location</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiMapPin size={20} color="var(--primary)" />
                    <p>Main Street Salon, Suite 101</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div style={{
                  background: 'var(--background)',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Notes</p>
                  <p style={{ color: 'var(--text-secondary)' }}>{selectedAppointment.notes}</p>
                </div>
              )}

              {/* Cancellation Reason (if cancelled) */}
              {selectedAppointment.status === 'CANCELLED' && selectedAppointment.cancellationReason && (
                <div style={{
                  background: 'rgba(232,17,35,0.1)',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  color: 'var(--error)'
                }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Cancellation Reason</p>
                  <p>{selectedAppointment.cancellationReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                borderTop: '1px solid var(--border)',
                paddingTop: '20px'
              }}>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>

                {selectedAppointment.status === 'BOOKED' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowRescheduleModal(true);
                      }}
                      className="btn btn-primary"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowCancelModal(true);
                      }}
                      className="btn btn-secondary"
                      style={{ background: 'var(--error)', color: 'white' }}
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}

                {selectedAppointment.status === 'COMPLETED' && 
                 user?.role === 'CUSTOMER' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowReviewModal(true);
                    }}
                    className="btn btn-primary"
                  >
                    Leave a Review
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="metro-tile"
              style={{ maxWidth: '400px', width: '100%', padding: '30px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px', color: 'var(--error)' }}>Cancel Appointment</h2>
              <p style={{ marginBottom: '20px' }}>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please tell us why you're cancelling..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn btn-secondary"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancelAppointment}
                  className="btn btn-primary"
                  style={{ background: 'var(--error)' }}
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="metro-tile"
              style={{ maxWidth: '400px', width: '100%', padding: '30px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Reschedule Appointment</h2>
              <p style={{ marginBottom: '20px' }}>
                You'll be able to choose a new date and time for your appointment. 
                The current appointment will be cancelled after rescheduling.
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  className="btn btn-primary"
                >
                  Continue to Reschedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="metro-tile"
              style={{ maxWidth: '400px', width: '100%', padding: '30px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px' }}>Leave a Review</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Rating
                </label>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <FiStar
                      key={star}
                      size={32}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      style={{
                        cursor: 'pointer',
                        fill: star <= reviewData.rating ? 'var(--warning)' : 'none',
                        stroke: star <= reviewData.rating ? 'var(--warning)' : 'var(--text-secondary)',
                        transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Your Review
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  className="btn btn-primary"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyAppointments;