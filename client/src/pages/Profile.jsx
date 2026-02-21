import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar,
  FiClock, FiBriefcase, FiStar, FiHeart, FiSettings,
  FiEdit2, FiSave, FiX, FiCamera, FiLock, FiBell,
  FiMoon, FiSun, FiGlobe, FiCreditCard,
  FiAward, FiTrendingUp, FiLogOut, FiShield,
  FiChevronRight, FiDownload, FiUpload, FiTrash2
} from 'react-icons/fi';
import { format } from 'date-fns';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    profilePicture: null,
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      language: 'en',
      theme: 'light'
    }
  });

  // Provider specific data
  const [providerData, setProviderData] = useState({
    specialization: '',
    experience: 0,
    bio: '',
    workingHours: [],
    services: [],
    stats: {
      totalAppointments: 0,
      totalClients: 0,
      averageRating: 0,
      totalReviews: 0,
      completionRate: 0
    }
  });

  // Customer specific data
  const [customerData, setCustomerData] = useState({
    favoriteServices: [],
    favoriteEmployees: [],
    stats: {
      totalAppointments: 0,
      cancelledAppointments: 0,
      totalSpent: 0,
      memberSince: ''
    }
  });

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Activity history
  const [recentActivity, setRecentActivity] = useState([]);

  // Upload states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileRes = await axios.get('http://localhost:5000/api/users/profile');
      setProfileData(profileRes.data);

      // Fetch role-specific data
      if (user?.role === 'PROVIDER') {
        const providerRes = await axios.get('http://localhost:5000/api/employees/my-profile');
        setProviderData(providerRes.data);
      } else if (user?.role === 'CUSTOMER') {
        const customerRes = await axios.get('http://localhost:5000/api/customers/profile');
        setCustomerData(customerRes.data);
      }

      // Fetch recent activity
      const activityRes = await axios.get('http://localhost:5000/api/users/activity');
      setRecentActivity(activityRes.data);

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await axios.put('http://localhost:5000/api/users/profile', profileData);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setUploading(true);
      const response = await axios.post('http://localhost:5000/api/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setProfileData({ ...profileData, profilePicture: response.data.profilePicture });
      setUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('http://localhost:5000/api/users/account');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'activity', label: 'Activity', icon: <FiStar /> },
    { id: 'preferences', label: 'Preferences', icon: <FiSettings /> },
    { id: 'security', label: 'Security', icon: <FiShield /> }
  ];

  if (user?.role === 'PROVIDER') {
    tabs.splice(1, 0, { id: 'provider', label: 'Professional', icon: <FiBriefcase /> });
  }

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
            👤
          </motion.div>
          <h3>Loading profile...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="profile-header"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '30px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Profile Picture */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '4px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              {profileData.profilePicture ? (
                <img 
                  src={profileData.profilePicture} 
                  alt={profileData.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '48px', color: 'var(--primary)' }}>
                  {profileData.fullName?.charAt(0) || user?.fullName?.charAt(0)}
                </span>
              )}
            </div>

            {/* Upload button */}
            <label
              htmlFor="profile-upload"
              style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                border: '2px solid var(--primary)'
              }}
            >
              <FiCamera color="var(--primary)" size={16} />
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: 'none' }}
              />
            </label>

            {/* Upload progress */}
            {uploading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {uploadProgress}%
              </div>
            )}
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div>
                <h1 style={{ fontSize: '32px', marginBottom: '5px' }}>
                  {profileData.fullName || user?.fullName}
                </h1>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiMail /> {profileData.email || user?.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FiPhone /> {profileData.phone || user?.phone || 'Not provided'}
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    fontSize: '14px'
                  }}>
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Edit/Save Buttons */}
              {editMode ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setEditMode(false)}
                    className="btn"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiX /> Cancel
                  </button>
                  <button
                    onClick={handleProfileUpdate}
                    className="btn"
                    style={{
                      background: 'white',
                      color: 'var(--primary)',
                      border: 'none',
                      padding: '10px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiSave /> Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiEdit2 /> Edit Profile
                </button>
              )}
            </div>

            {/* Member since */}
            <div style={{
              marginTop: '15px',
              fontSize: '14px',
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FiCalendar /> Member since {format(new Date(user?.createdAt || Date.now()), 'MMMM yyyy')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '10px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.3s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="metro-grid">
              {/* Personal Information */}
              <div className="metro-tile" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ marginBottom: '20px' }}>Personal Information</h3>
                
                {editMode ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                  }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Address
                      </label>
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder="Street, City, State, ZIP"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px'
                  }}>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Full Name</p>
                      <p style={{ fontWeight: 'bold' }}>{profileData.fullName || user?.fullName}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Address</p>
                      <p style={{ fontWeight: 'bold' }}>{profileData.email || user?.email}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone Number</p>
                      <p style={{ fontWeight: 'bold' }}>{profileData.phone || user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Date of Birth</p>
                      <p style={{ fontWeight: 'bold' }}>
                        {profileData.dateOfBirth ? format(new Date(profileData.dateOfBirth), 'MMMM d, yyyy') : 'Not provided'}
                      </p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Address</p>
                      <p style={{ fontWeight: 'bold' }}>{profileData.address || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Statistics */}
              <div className="metro-tile">
                <h3 style={{ marginBottom: '20px' }}>Account Statistics</h3>
                {user?.role === 'CUSTOMER' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: 'var(--background)',
                      borderRadius: '8px'
                    }}>
                      <span>Total Appointments</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        {customerData.stats?.totalAppointments || 0}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: 'var(--background)',
                      borderRadius: '8px'
                    }}>
                      <span>Cancelled Appointments</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--error)' }}>
                        {customerData.stats?.cancelledAppointments || 0}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: 'var(--background)',
                      borderRadius: '8px'
                    }}>
                      <span>Total Spent</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary)' }}>
                        ${customerData.stats?.totalSpent || 0}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: 'var(--background)',
                      borderRadius: '8px'
                    }}>
                      <span>Favorite Services</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        {customerData.favoriteServices?.length || 0}
                      </span>
                    </div>
                  </div>
                )}

                {user?.role === 'PROVIDER' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: 'var(--background)',
                      borderRadius: '8px'
                    }}>
                      <span>Total Appointments</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        {providerData.stats?.totalAppointments || 0}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: 'var(--background)',
                      borderRadius: '8px'
                    }}>
                      <span>Total Clients</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        {providerData.stats?.totalClients || 0}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: 'var(--background)',
                      borderRadius: '8px'
                    }}>
                      <span>Average Rating</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--warning)' }}>
                        {providerData.stats?.averageRating?.toFixed(1) || '0.0'} ⭐
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      background: 'var(--background)',
                      borderRadius: '8px'
                    }}>
                      <span>Completion Rate</span>
                      <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--success)' }}>
                        {providerData.stats?.completionRate || 0}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity Preview */}
              <div className="metro-tile">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <h3>Recent Activity</h3>
                  <FiChevronRight 
                    size={20} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveTab('activity')}
                  />
                </div>
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '10px',
                      borderBottom: index < 2 ? '1px solid var(--border)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: activity.type === 'appointment' ? 'var(--blue)' :
                                  activity.type === 'review' ? 'var(--green)' : 'var(--orange)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {activity.type === 'appointment' ? <FiCalendar /> :
                       activity.type === 'review' ? <FiStar /> : <FiHeart />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{activity.description}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'provider' && user?.role === 'PROVIDER' && (
          <motion.div
            key="provider"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="metro-grid">
              {/* Professional Info */}
              <div className="metro-tile" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ marginBottom: '20px' }}>Professional Information</h3>
                
                {editMode ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                  }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={providerData.specialization}
                        onChange={(e) => setProviderData({ ...providerData, specialization: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        value={providerData.experience}
                        onChange={(e) => setProviderData({ ...providerData, experience: parseInt(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Bio / Description
                      </label>
                      <textarea
                        value={providerData.bio}
                        onChange={(e) => setProviderData({ ...providerData, bio: e.target.value })}
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
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px'
                  }}>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Specialization</p>
                      <p style={{ fontWeight: 'bold' }}>{providerData.specialization}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Experience</p>
                      <p style={{ fontWeight: 'bold' }}>{providerData.experience} years</p>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Bio</p>
                      <p style={{ fontWeight: 'bold' }}>{providerData.bio}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Working Hours */}
              <div className="metro-tile">
                <h3 style={{ marginBottom: '20px' }}>Working Hours</h3>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                  const schedule = providerData.workingHours?.find(w => w.dayOfWeek === index);
                  return (
                    <div
                      key={day}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: index < 6 ? '1px solid var(--border)' : 'none'
                      }}
                    >
                      <span style={{ fontWeight: 'bold' }}>{day}</span>
                      {schedule && schedule.isAvailable ? (
                        <span style={{ color: 'var(--success)' }}>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--error)' }}>Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Services Offered */}
              <div className="metro-tile">
                <h3 style={{ marginBottom: '20px' }}>Services Offered</h3>
                {providerData.services?.map((service, index) => (
                  <div
                    key={service._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px',
                      background: 'var(--background)',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold' }}>{service.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {service.durationMinutes} min
                      </p>
                    </div>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                      ${service.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="metro-tile">
              <h3 style={{ marginBottom: '20px' }}>Activity History</h3>
              
              {recentActivity.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px',
                        background: 'var(--background)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: activity.type === 'appointment' ? 'var(--blue)' :
                                  activity.type === 'review' ? 'var(--green)' :
                                  activity.type === 'booking' ? 'var(--purple)' : 'var(--orange)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {activity.type === 'appointment' ? <FiCalendar /> :
                         activity.type === 'review' ? <FiStar /> :
                         activity.type === 'booking' ? <FiHeart /> : <FiSettings />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{activity.description}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {format(new Date(activity.timestamp), 'EEEE, MMMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      {activity.status && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: activity.status === 'success' ? 'var(--success)' :
                                      activity.status === 'pending' ? 'var(--warning)' : 'var(--error)',
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {activity.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <FiStar size={48} style={{ color: 'var(--text-secondary)', marginBottom: '15px' }} />
                  <h3>No activity yet</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Your recent activities will appear here
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="metro-grid">
              {/* Notifications */}
              <div className="metro-tile">
                <h3 style={{ marginBottom: '20px' }}>Notifications</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={profileData.preferences?.notifications?.email}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          notifications: {
                            ...profileData.preferences?.notifications,
                            email: e.target.checked
                          }
                        }
                      })}
                    />
                    <div>
                      <p style={{ fontWeight: 'bold' }}>Email Notifications</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Receive updates via email
                      </p>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={profileData.preferences?.notifications?.sms}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          notifications: {
                            ...profileData.preferences?.notifications,
                            sms: e.target.checked
                          }
                        }
                      })}
                    />
                    <div>
                      <p style={{ fontWeight: 'bold' }}>SMS Notifications</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Get text messages for updates
                      </p>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={profileData.preferences?.notifications?.push}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          notifications: {
                            ...profileData.preferences?.notifications,
                            push: e.target.checked
                          }
                        }
                      })}
                    />
                    <div>
                      <p style={{ fontWeight: 'bold' }}>Push Notifications</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Browser push notifications
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Appearance */}
              <div className="metro-tile">
                <h3 style={{ marginBottom: '20px' }}>Appearance</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Theme
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setProfileData({
                          ...profileData,
                          preferences: { ...profileData.preferences, theme: 'light' }
                        })}
                        className={`btn ${profileData.preferences?.theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                      >
                        <FiSun /> Light
                      </button>
                      <button
                        onClick={() => setProfileData({
                          ...profileData,
                          preferences: { ...profileData.preferences, theme: 'dark' }
                        })}
                        className={`btn ${profileData.preferences?.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                      >
                        <FiMoon /> Dark
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Language
                    </label>
                    <select
                      value={profileData.preferences?.language || 'en'}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: { ...profileData.preferences, language: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid var(--border)',
                        borderRadius: '4px'
                      }}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div className="metro-tile">
                <h3 style={{ marginBottom: '20px' }}>Privacy</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" />
                    <div>
                      <p style={{ fontWeight: 'bold' }}>Show profile in search results</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Allow others to find your profile
                      </p>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" />
                    <div>
                      <p style={{ fontWeight: 'bold' }}>Share activity anonymously</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Help improve recommendations
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="metro-grid">
              {/* Password Change */}
              <div className="metro-tile">
                <h3 style={{ marginBottom: '20px' }}>Password & Security</h3>
                
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                  <FiLock /> Change Password
                </button>

                <div style={{
                  padding: '15px',
                  background: 'var(--background)',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiShield size={20} color="var(--success)" />
                    <div>
                      <p style={{ fontWeight: 'bold' }}>Two-Factor Authentication</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Add an extra layer of security
                      </p>
                    </div>
                    <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
                      Enable
                    </button>
                  </div>
                </div>

                <div style={{
                  padding: '15px',
                  background: 'var(--background)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiClock size={20} color="var(--primary)" />
                    <div>
                      <p style={{ fontWeight: 'bold' }}>Session Timeout</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Automatically log out after 30 minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sessions */}
              <div className="metro-tile">
                <h3 style={{ marginBottom: '20px' }}>Active Sessions</h3>
                
                <div style={{
                  padding: '15px',
                  background: 'var(--background)',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div>
                      <p style={{ fontWeight: 'bold' }}>Current Session</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Chrome on Windows • Started {format(new Date(), 'h:mm a')}
                      </p>
                    </div>
                    <span style={{
                      marginLeft: 'auto',
                      padding: '2px 8px',
                      background: 'var(--success)',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      Active Now
                    </span>
                  </div>
                </div>

                <button className="btn btn-secondary" style={{ width: '100%' }}>
                  Sign Out All Devices
                </button>
              </div>

              {/* Danger Zone */}
              <div className="metro-tile" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--error)' }}>Danger Zone</h3>
                
                <div style={{
                  padding: '20px',
                  border: '2px solid var(--error)',
                  borderRadius: '8px',
                  background: 'rgba(232,17,35,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                        Delete Account
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn btn-primary"
                      style={{ background: 'var(--error)' }}
                    >
                      <FiTrash2 /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
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
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="metro-tile"
              style={{ maxWidth: '400px', width: '100%', padding: '30px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px' }}>Change Password</h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="btn btn-primary"
                >
                  Change Password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="metro-tile"
              style={{ maxWidth: '400px', width: '100%', padding: '30px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px', color: 'var(--error)' }}>Delete Account</h2>
              <p style={{ marginBottom: '20px' }}>
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-primary"
                  style={{ background: 'var(--error)' }}
                >
                  Yes, Delete My Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;