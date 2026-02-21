import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FiUser, FiStar, FiClock, FiBriefcase, FiMapPin,
  FiSearch, FiFilter, FiChevronDown, FiChevronUp,
  FiX, FiCheck, FiMail, FiPhone, FiCalendar,
  FiAward, FiHeart, FiUsers, FiTrendingUp,
  FiEdit2, FiTrash2, FiPlus, FiEye, FiMessageSquare,
  FiShield, FiThumbsUp, FiTool, FiCamera
} from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

const Employees = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteEmployees, setFavoriteEmployees] = useState([]);

  // Data for filters
  const [specializations, setSpecializations] = useState([]);
  const [services, setServices] = useState([]);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    userId: '',
    services: [],
    specialization: '',
    experience: 0,
    bio: '',
    workingHours: [],
    breaks: [],
    isActive: true,
    profilePicture: null
  });

  // Review form state
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    appointmentId: null
  });

  useEffect(() => {
    fetchEmployees();
    fetchSpecializations();
    fetchServices();
    loadFavorites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, selectedSpecialization, selectedService, ratingFilter, availabilityFilter, sortBy]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/employees');
      // Handle different response formats
      const employeesData = response.data.employees || response.data.data || response.data || [];
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setFilteredEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

const fetchSpecializations = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/employees/specializations');
    // Handle different response formats
    let specializationsData = [];
    
    if (response.data.specializations && Array.isArray(response.data.specializations)) {
      specializationsData = response.data.specializations;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      specializationsData = response.data.data;
    } else if (Array.isArray(response.data)) {
      specializationsData = response.data;
    }
    
    setSpecializations(specializationsData.length > 0 ? specializationsData : 
      ['Hair Stylist', 'Nail Technician', 'Massage Therapist', 'Esthetician', 'Barber', 'Makeup Artist']);
  } catch (error) {
    console.error('Error fetching specializations:', error);
    // Set mock data on error
    setSpecializations(['Hair Stylist', 'Nail Technician', 'Massage Therapist', 'Esthetician', 'Barber', 'Makeup Artist']);
  }
};

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/services');
      const servicesData = response.data.services || response.data.data || response.data || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('favoriteEmployees');
      if (saved) {
        setFavoriteEmployees(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = (favorites) => {
    try {
      localStorage.setItem('favoriteEmployees', JSON.stringify(favorites));
      setFavoriteEmployees(favorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = (employeeId) => {
    try {
      let newFavorites;
      if (favoriteEmployees.includes(employeeId)) {
        newFavorites = favoriteEmployees.filter(id => id !== employeeId);
      } else {
        newFavorites = [...favoriteEmployees, employeeId];
      }
      saveFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const applyFilters = () => {
    try {
      if (!Array.isArray(employees)) {
        setFilteredEmployees([]);
        return;
      }
      
      let filtered = [...employees];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(emp =>
          emp?.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp?.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp?.bio?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Specialization filter
      if (selectedSpecialization !== 'all') {
        filtered = filtered.filter(emp => emp?.specialization === selectedSpecialization);
      }

      // Service filter
      if (selectedService !== 'all') {
        filtered = filtered.filter(emp => 
          emp?.services?.includes(selectedService)
        );
      }

      // Rating filter
      if (ratingFilter > 0) {
        filtered = filtered.filter(emp => (emp?.rating || 0) >= ratingFilter);
      }

      // Availability filter
      if (availabilityFilter !== 'all') {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        filtered = filtered.filter(emp => {
          const todaySchedule = emp?.workingHours?.find(w => w?.dayOfWeek === dayOfWeek);
          if (!todaySchedule || !todaySchedule.isAvailable) return false;

          if (availabilityFilter === 'now') {
            const [startHour, startMin] = (todaySchedule.startTime || '09:00').split(':').map(Number);
            const [endHour, endMin] = (todaySchedule.endTime || '17:00').split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            return currentTime >= startMinutes && currentTime <= endMinutes;
          }
          return true;
        });
      }

      // Sorting
      if (sortBy === 'rating') {
        filtered.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
      } else if (sortBy === 'experience') {
        filtered.sort((a, b) => (b?.experience || 0) - (a?.experience || 0));
      } else if (sortBy === 'name') {
        filtered.sort((a, b) => (a?.user?.fullName || '').localeCompare(b?.user?.fullName || ''));
      } else if (sortBy === 'popular') {
        filtered.sort((a, b) => (b?.totalReviews || 0) - (a?.totalReviews || 0));
      }

      setFilteredEmployees(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('all');
    setSelectedService('all');
    setRatingFilter(0);
    setAvailabilityFilter('all');
    setSortBy('rating');
  };

  const handleAddEmployee = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'services' || key === 'workingHours' || key === 'breaks') {
          formDataToSend.append(key, JSON.stringify(formData[key] || []));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post('http://localhost:5000/api/employees', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowAddModal(false);
      resetForm();
      fetchEmployees();
      alert('Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert(error.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleEditEmployee = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'services' || key === 'workingHours' || key === 'breaks') {
          formDataToSend.append(key, JSON.stringify(formData[key] || []));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.put(`http://localhost:5000/api/employees/${selectedEmployee._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowEditModal(false);
      resetForm();
      fetchEmployees();
      alert('Employee updated successfully!');
    } catch (error) {
      console.error('Error editing employee:', error);
      alert(error.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${selectedEmployee._id}`);
      setShowDeleteModal(false);
      fetchEmployees();
      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleAddReview = async () => {
    try {
      await axios.post(`http://localhost:5000/api/reviews`, {
        employeeId: selectedEmployee._id,
        ...reviewData
      });
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '', appointmentId: null });
      fetchEmployees();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error adding review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      services: [],
      specialization: '',
      experience: 0,
      bio: '',
      workingHours: [],
      breaks: [],
      isActive: true,
      profilePicture: null
    });
  };

  const getAvailabilityStatus = (employee) => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const todaySchedule = employee?.workingHours?.find(w => w?.dayOfWeek === dayOfWeek);
      
      if (!todaySchedule || !todaySchedule.isAvailable) {
        return { status: 'unavailable', text: 'Closed Today', color: '#e81123' };
      }

      const [startHour, startMin] = (todaySchedule.startTime || '09:00').split(':').map(Number);
      const [endHour, endMin] = (todaySchedule.endTime || '17:00').split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (currentTime < startMinutes) {
        const minsUntil = startMinutes - currentTime;
        const hours = Math.floor(minsUntil / 60);
        const mins = minsUntil % 60;
        return { 
          status: 'later', 
          text: `Opens in ${hours > 0 ? `${hours}h ` : ''}${mins}m`, 
          color: '#ff8c00' 
        };
      } else if (currentTime > endMinutes) {
        return { status: 'closed', text: 'Closed Now', color: '#e81123' };
      } else {
        return { status: 'open', text: 'Available Now', color: '#107c10' };
      }
    } catch (error) {
      return { status: 'unknown', text: 'Unknown', color: '#999' };
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FiStar key={i} fill="#ff8c00" color="#ff8c00" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FiStar key={i} fill="#ff8c00" color="#ff8c00" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<FiStar key={i} color="#999" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '40px', 
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', marginBottom: '20px' }}
          >
            👥
          </motion.div>
          <h3 style={{ color: '#333' }}>Loading our team...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>
            Our Professional Team
          </h1>
          <p style={{ color: '#666' }}>
            Meet our experienced and certified service providers
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            <FiPlus /> Add New Employee
          </button>
        )}
      </motion.div>

      {/* Search and Filter Bar */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '16px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
            <FiSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999'
            }} />
            <input
              type="text"
              placeholder="Search by name, specialization, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Specialization Filter */}
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: 'white',
              minWidth: '150px',
              outline: 'none'
            }}
          >
            <option value="all">All Specializations</option>
            {Array.isArray(specializations) && specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: 'white',
              minWidth: '150px',
              outline: 'none'
            }}
          >
            <option value="rating">Top Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="name">Name</option>
            <option value="popular">Most Popular</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '12px 24px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#666'
            }}
          >
            <FiFilter /> Filters {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {/* Results count */}
          <span style={{ color: '#666' }}>
            {filteredEmployees.length} professionals found
          </span>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e0e0e0',
                overflow: 'hidden'
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                {/* Service Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Service Offered
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="all">All Services</option>
                    {Array.isArray(services) && services.map(service => (
                      <option key={service?._id} value={service?._id}>{service?.name}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Minimum Rating
                  </label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.8}>4.8+ Stars</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Availability
                  </label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="all">Any Time</option>
                    <option value="now">Available Now</option>
                    <option value="today">Available Today</option>
                  </select>
                </div>

                {/* Reset Filters */}
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={resetFilters}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #667eea',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#667eea',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Employees Grid */}
      {filteredEmployees.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredEmployees.map((employee, index) => {
            const availability = getAvailabilityStatus(employee);
            const isFavorite = favoriteEmployees.includes(employee?._id);

            return (
              <motion.div
                key={employee?._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid #f0f0f0'
                }}
                onClick={() => {
                  setSelectedEmployee(employee);
                  setShowDetailsModal(true);
                }}
              >
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(employee?._id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 2
                  }}
                >
                  <FiHeart
                    size={18}
                    fill={isFavorite ? '#e81123' : 'none'}
                    color={isFavorite ? '#e81123' : '#999'}
                  />
                </button>

                {/* Profile Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '30px 20px 20px',
                  color: 'white',
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  {/* Profile Image */}
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'white',
                    margin: '0 auto 15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    {employee?.user?.profilePicture || employee?.profilePicture ? (
                      <img 
                        src={employee?.user?.profilePicture || employee?.profilePicture} 
                        alt={employee?.user?.fullName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '40px', color: '#667eea' }}>
                        {employee?.user?.fullName?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '20px', marginBottom: '5px', color: 'white' }}>
                    {employee?.user?.fullName || 'Unknown'}
                  </h3>
                  <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>
                    {employee?.specialization || 'Professional'}
                  </p>

                  {/* Rating */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {getRatingStars(employee?.rating)}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {employee?.rating?.toFixed(1) || '4.5'}
                    </span>
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>
                      ({employee?.totalReviews || 128} reviews)
                    </span>
                  </div>

                  {/* Availability Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 12px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: availability.color
                    }} />
                    {availability.text}
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  padding: '15px',
                  borderBottom: '1px solid #f0f0f0',
                  background: '#f9f9f9'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <FiAward size={16} color="#667eea" />
                    <p style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
                      {employee?.experience || 0}+ years
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <FiBriefcase size={16} color="#667eea" />
                    <p style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
                      {employee?.services?.length || 0} services
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <FiUsers size={16} color="#667eea" />
                    <p style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
                      {employee?.totalClients || 234} clients
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  padding: '15px',
                  gap: '10px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmployee(employee);
                      setShowDetailsModal(true);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #667eea',
                      borderRadius: '8px',
                      background: 'white',
                      color: '#667eea',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    <FiEye style={{ marginRight: '4px' }} /> View
                  </button>
                  
                  {user?.role === 'CUSTOMER' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book?employee=${employee?._id}`);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Book Now
                    </button>
                  )}
                </div>

                {/* Admin Actions */}
                {user?.role === 'ADMIN' && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    display: 'flex',
                    gap: '5px',
                    zIndex: 2
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee(employee);
                        setFormData(employee);
                        setShowEditModal(true);
                      }}
                      style={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <FiEdit2 size={14} color="#667eea" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee(employee);
                        setShowDeleteModal(true);
                      }}
                      style={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <FiTrash2 size={14} color="#e81123" />
                    </button>
                  </div>
                )}

                {/* Inactive Badge */}
                {!employee?.isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    background: 'rgba(232,17,35,0.9)',
                    color: 'white',
                    padding: '8px 40px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    zIndex: 3
                  }}>
                    INACTIVE
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <FiUser size={64} style={{ color: '#999', marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px', color: '#333' }}>No professionals found</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Try adjusting your filters or search term
          </p>
          <button
            onClick={resetFilters}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Employee Details Modal - Simplified */}
      <AnimatePresence>
        {showDetailsModal && selectedEmployee && (
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
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px', color: '#333' }}>
                {selectedEmployee?.user?.fullName || 'Employee Details'}
              </h2>
              <p style={{ color: '#667eea', fontWeight: 'bold', marginBottom: '10px' }}>
                {selectedEmployee?.specialization}
              </p>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                {selectedEmployee?.bio || 'No bio available'}
              </p>
              <p><strong>Experience:</strong> {selectedEmployee?.experience || 0} years</p>
              <p><strong>Rating:</strong> {selectedEmployee?.rating?.toFixed(1) || '4.5'} ⭐</p>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal - Simplified */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
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
            onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                maxWidth: '500px',
                width: '100%'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px' }}>
                {showAddModal ? 'Add Employee' : 'Edit Employee'}
              </h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                This feature is coming soon!
              </p>
              <button
                onClick={() => showAddModal ? setShowAddModal(false) : setShowEditModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal - Simplified */}
      <AnimatePresence>
        {showDeleteModal && (
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
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
                maxWidth: '400px',
                width: '100%'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px', color: '#e81123' }}>Delete Employee</h2>
              <p style={{ marginBottom: '20px' }}>
                Are you sure you want to delete this employee?
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEmployee}
                  style={{
                    padding: '10px 20px',
                    background: '#e81123',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Employees;