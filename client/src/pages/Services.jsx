import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FiBriefcase, FiClock, FiDollarSign, FiStar,
  FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2,
  FiChevronDown, FiChevronUp, FiX, FiCheck,
  FiTag, FiTrendingUp, FiUsers, FiCalendar,
  FiEye, FiHeart, FiShoppingBag, FiAward
} from 'react-icons/fi';

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [durationRange, setDurationRange] = useState({ min: 0, max: 240 });
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteServices, setFavoriteServices] = useState([]);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    durationMinutes: 60,
    price: 0,
    tags: [],
    image: null,
    isActive: true
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchServices();
    fetchCategories();
    loadFavorites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, searchTerm, selectedCategory, priceRange, durationRange, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/services');
      // Handle different response formats
      const servicesData = response.data.services || response.data.data || response.data || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setFilteredServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/services/categories');
      const categoriesData = response.data.categories || response.data.data || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Mock categories if API not ready
      setCategories(['HAIR', 'NAILS', 'SPA', 'MASSAGE', 'FACIAL', 'OTHER']);
    }
  };

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('favoriteServices');
      if (saved) {
        setFavoriteServices(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = (favorites) => {
    try {
      localStorage.setItem('favoriteServices', JSON.stringify(favorites));
      setFavoriteServices(favorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = (serviceId) => {
    try {
      let newFavorites;
      if (favoriteServices.includes(serviceId)) {
        newFavorites = favoriteServices.filter(id => id !== serviceId);
      } else {
        newFavorites = [...favoriteServices, serviceId];
      }
      saveFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const applyFilters = () => {
    try {
      if (!Array.isArray(services)) {
        setFilteredServices([]);
        return;
      }
      
      let filtered = [...services];

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(service =>
          service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service?.tags?.some(tag => tag?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Category filter
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(service => service?.category === selectedCategory);
      }

      // Price range filter
      filtered = filtered.filter(service =>
        service?.price >= priceRange.min && service?.price <= priceRange.max
      );

      // Duration range filter
      filtered = filtered.filter(service =>
        service?.durationMinutes >= durationRange.min && 
        service?.durationMinutes <= durationRange.max
      );

      // Sorting
      if (sortBy === 'popular') {
        filtered.sort((a, b) => (b?.popularity || 0) - (a?.popularity || 0));
      } else if (sortBy === 'price-low') {
        filtered.sort((a, b) => (a?.price || 0) - (b?.price || 0));
      } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => (b?.price || 0) - (a?.price || 0));
      } else if (sortBy === 'duration') {
        filtered.sort((a, b) => (a?.durationMinutes || 0) - (b?.durationMinutes || 0));
      } else if (sortBy === 'name') {
        filtered.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
      }

      setFilteredServices(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 1000 });
    setDurationRange({ min: 0, max: 240 });
    setSortBy('popular');
  };

  const handleAddService = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post('http://localhost:5000/api/services', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowAddModal(false);
      resetForm();
      fetchServices();
      alert('Service added successfully!');
    } catch (error) {
      console.error('Error adding service:', error);
      alert(error.response?.data?.message || 'Failed to add service');
    }
  };

  const handleEditService = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.put(`http://localhost:5000/api/services/${selectedService._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowEditModal(false);
      resetForm();
      fetchServices();
      alert('Service updated successfully!');
    } catch (error) {
      console.error('Error editing service:', error);
      alert(error.response?.data?.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/services/${selectedService._id}`);
      setShowDeleteModal(false);
      fetchServices();
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert(error.response?.data?.message || 'Failed to delete service');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      durationMinutes: 60,
      price: 0,
      tags: [],
      image: null,
      isActive: true
    });
    setTagInput('');
  };

  const getCategoryColor = (category) => {
    const colors = {
      'HAIR': 'blue',
      'NAILS': 'purple',
      'SPA': 'green',
      'MASSAGE': 'orange',
      'FACIAL': 'pink',
      'OTHER': 'gray'
    };
    return colors[category] || 'blue';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'HAIR': '💇',
      'NAILS': '💅',
      'SPA': '🧖',
      'MASSAGE': '💆',
      'FACIAL': '✨',
      'OTHER': '🛠️'
    };
    return icons[category] || '📋';
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
        <div className="metro-tile" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', marginBottom: '20px' }}
          >
            💼
          </motion.div>
          <h3>Loading services...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
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
            Our Services
          </h1>
          <p style={{ color: '#666' }}>
            Discover our wide range of professional services
          </p>
        </div>

        {(user?.role === 'PROVIDER' || user?.role === 'ADMIN') && (
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
            <FiPlus /> Add New Service
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
              placeholder="Search services by name, description, or tags..."
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

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: 'white',
              minWidth: '150px',
              outline: 'none'
            }}
          >
            <option value="all">All Categories</option>
            {Array.isArray(categories) && categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
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
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="duration">Duration</option>
            <option value="name">Name</option>
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
            {filteredServices.length} services found
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {/* Price Range */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Price Range (${priceRange.min} - ${priceRange.max})
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                {/* Duration Range */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Duration (minutes)
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={durationRange.min}
                      onChange={(e) => setDurationRange({ ...durationRange, min: parseInt(e.target.value) })}
                      style={{ width: '80px', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={durationRange.max}
                      onChange={(e) => setDurationRange({ ...durationRange, max: parseInt(e.target.value) })}
                      style={{ width: '80px', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
                    />
                  </div>
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

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredServices.map((service, index) => (
            <motion.div
              key={service?._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #f0f0f0'
              }}
              onClick={() => {
                setSelectedService(service);
                setShowDetailsModal(true);
              }}
            >
              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(service._id);
                }}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 1
                }}
              >
                <FiHeart
                  fill={favoriteServices.includes(service._id) ? '#e81123' : 'none'}
                  color={favoriteServices.includes(service._id) ? '#e81123' : '#999'}
                />
              </button>

              {/* Category Badge */}
              <div style={{
                background: '#667eea',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                marginBottom: '15px'
              }}>
                <span>{getCategoryIcon(service.category)}</span>
                {service.category}
              </div>

              {/* Service Info */}
              <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#333' }}>{service.name}</h3>
              <p style={{
                color: '#666',
                fontSize: '14px',
                marginBottom: '15px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.5'
              }}>
                {service.description}
              </p>

              {/* Tags */}
              {service.tags && service.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '5px',
                  flexWrap: 'wrap',
                  marginBottom: '15px'
                }}>
                  {service.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#f5f5f5',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#666'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                  {service.tags.length > 3 && (
                    <span style={{ fontSize: '11px', color: '#999' }}>
                      +{service.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                fontSize: '13px',
                color: '#666'
              }}>
                <span><FiClock /> {service.durationMinutes} min</span>
                <span><FiStar /> {service.rating || '4.5'} ({service.reviews || 128})</span>
                <span><FiUsers /> {service.popularity || 234}</span>
              </div>

              {/* Price and Action */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '15px'
              }}>
                <div>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                    ${service.price}
                  </span>
                </div>
                
                {user?.role === 'CUSTOMER' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/book?service=${service._id}`);
                    }}
                    style={{
                      padding: '8px 16px',
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

                {(user?.role === 'PROVIDER' || user?.role === 'ADMIN') && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                        setFormData(service);
                        setShowEditModal(true);
                      }}
                      style={{
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <FiEdit2 color="#667eea" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                        setShowDeleteModal(true);
                      }}
                      style={{
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <FiTrash2 color="#e81123" />
                    </button>
                  </div>
                )}
              </div>

              {/* Active/Inactive Badge for Providers */}
              {(user?.role === 'PROVIDER' || user?.role === 'ADMIN') && !service.isActive && (
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '15px',
                  background: '#e81123',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  INACTIVE
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <FiBriefcase size={64} style={{ color: '#999', marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px', color: '#333' }}>No services found</h2>
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

      {/* Service Details Modal - Simplified for now */}
      <AnimatePresence>
        {showDetailsModal && selectedService && (
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
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px', color: '#333' }}>{selectedService.name}</h2>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
                {selectedService.description}
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <span style={{ color: '#999' }}>Duration:</span>
                  <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{selectedService.durationMinutes} min</span>
                </div>
                <div>
                  <span style={{ color: '#999' }}>Price:</span>
                  <span style={{ fontWeight: 'bold', marginLeft: '8px', color: '#667eea' }}>${selectedService.price}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
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
    </div>
  );
};

export default Services;