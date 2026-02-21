import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FiUsers, FiBriefcase, FiCalendar, FiDollarSign,
  FiTrendingUp, FiPieChart, FiSettings, FiBell,
  FiUserCheck, FiUserX, FiStar, FiClock,
  FiActivity, FiDownload, FiFilter, FiRefreshCw,
  FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch,
  FiChevronDown, FiChevronUp, FiMoreVertical,
  FiBarChart2, FiServer, FiShield, FiAlertCircle
} from 'react-icons/fi';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  
  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalProviders: 0,
    totalAdmins: 0,
    totalServices: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    avgRating: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    systemHealth: 98.5,
    serverUptime: '99.9%'
  });

  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);

  // Chart data
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);

  // UI states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        usersRes,
        servicesRes,
        appointmentsRes,
        statsRes,
        activitiesRes,
        logsRes,
        notificationsRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users'),
        axios.get('http://localhost:5000/api/admin/services'),
        axios.get('http://localhost:5000/api/admin/appointments'),
        axios.get('http://localhost:5000/api/admin/stats'),
        axios.get('http://localhost:5000/api/admin/activities'),
        axios.get('http://localhost:5000/api/admin/logs'),
        axios.get('http://localhost:5000/api/admin/notifications')
      ]);

      setUsers(usersRes.data);
      setServices(servicesRes.data);
      setAppointments(appointmentsRes.data);
      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data);
      setSystemLogs(logsRes.data);
      setNotifications(notificationsRes.data);

      // Generate chart data from real data
      generateChartData(usersRes.data, appointmentsRes.data, servicesRes.data);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (users, appointments, services) => {
    // User growth data (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const userGrowth = last7Days.map(date => ({
      date,
      customers: users.filter(u => 
        u.role === 'CUSTOMER' && 
        u.createdAt?.startsWith(date)
      ).length,
      providers: users.filter(u => 
        u.role === 'PROVIDER' && 
        u.createdAt?.startsWith(date)
      ).length
    }));
    setUserGrowthData(userGrowth);

    // Revenue data
    const revenueByDay = last7Days.map(date => ({
      date,
      revenue: appointments
        .filter(a => a.startTime?.startsWith(date) && a.status === 'COMPLETED')
        .reduce((sum, a) => sum + (a.service?.price || 0), 0)
    }));
    setRevenueData(revenueByDay);

    // Popular services
    const serviceCounts = services.map(service => ({
      name: service.name,
      count: appointments.filter(a => a.service?._id === service._id).length
    })).sort((a, b) => b.count - a.count).slice(0, 5);
    setPopularServices(serviceCounts);

    // Peak hours
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const peakHours = hours.map(hour => ({
      hour: `${hour}:00`,
      appointments: appointments.filter(a => {
        const aptHour = new Date(a.startTime).getHours();
        return aptHour === hour;
      }).length
    }));
    setPeakHoursData(peakHours);
  };

  const handleUserAction = async (userId, action) => {
    try {
      switch(action) {
        case 'suspend':
          await axios.patch(`http://localhost:5000/api/admin/users/${userId}/suspend`);
          break;
        case 'activate':
          await axios.patch(`http://localhost:5000/api/admin/users/${userId}/activate`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user?')) {
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
          }
          break;
        case 'make-provider':
          await axios.patch(`http://localhost:5000/api/admin/users/${userId}/make-provider`);
          break;
      }
      // Refresh data
      fetchAdminData();
    } catch (error) {
      console.error('Error performing user action:', error);
      alert('Failed to perform action');
    }
  };

  const handleServiceAction = async (serviceId, action) => {
    try {
      switch(action) {
        case 'delete':
          if (window.confirm('Are you sure you want to delete this service?')) {
            await axios.delete(`http://localhost:5000/api/admin/services/${serviceId}`);
          }
          break;
        case 'toggle-active':
          await axios.patch(`http://localhost:5000/api/admin/services/${serviceId}/toggle`);
          break;
      }
      fetchAdminData();
    } catch (error) {
      console.error('Error performing service action:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <FiUsers size={32} />,
      color: 'blue',
      trend: '+12% this month',
      details: `${stats.totalCustomers} customers, ${stats.totalProviders} providers`
    },
    {
      title: 'Total Services',
      value: stats.totalServices,
      icon: <FiBriefcase size={32} />,
      color: 'green',
      trend: '+5 new services',
      details: 'Across all categories'
    },
    {
      title: 'Appointments',
      value: stats.totalAppointments,
      icon: <FiCalendar size={32} />,
      color: 'purple',
      trend: '+23% vs last month',
      details: `${stats.totalAppointments - (stats.totalAppointments * 0.23)} completed`
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <FiDollarSign size={32} />,
      color: 'orange',
      trend: '+18% growth',
      details: 'This month'
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth}%`,
      icon: <FiServer size={32} />,
      color: 'teal',
      trend: `Uptime: ${stats.serverUptime}`,
      details: 'All systems operational'
    },
    {
      title: 'Average Rating',
      value: `${stats.avgRating} ⭐`,
      icon: <FiStar size={32} />,
      color: 'red',
      trend: 'Based on 1.2k reviews',
      details: 'Excellent satisfaction'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiPieChart /> },
    { id: 'users', label: 'Users', icon: <FiUsers /> },
    { id: 'services', label: 'Services', icon: <FiBriefcase /> },
    { id: 'appointments', label: 'Appointments', icon: <FiCalendar /> },
    { id: 'analytics', label: 'Analytics', icon: <FiTrendingUp /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> }
  ];

  const COLORS = ['#0078d4', '#00b294', '#881798', '#ff8c00', '#e81123'];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
      }}>
        <motion.div 
          className="metro-tile"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', padding: '40px' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', marginBottom: '20px' }}
          >
            ⚙️
          </motion.div>
          <h2 style={{ marginBottom: '10px' }}>Loading Admin Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Preparing system analytics...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="header-section"
        style={{
          background: 'linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%)',
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
            Admin Dashboard
          </h1>
          <p style={{ opacity: 0.8 }}>
            Welcome back, {user?.fullName} • System Administrator
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>

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
                  width: '20px',
                  height: '20px',
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
                    width: '350px',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    padding: '15px',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>System Notifications</span>
                    <FiSettings style={{ cursor: 'pointer' }} />
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif._id} style={{
                          padding: '15px',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          background: notif.status === 'PENDING' ? 'rgba(0,120,212,0.05)' : 'white'
                        }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: notif.status === 'PENDING' ? 'var(--error)' : 'var(--success)',
                              marginTop: '6px'
                            }} />
                            <div>
                              <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{notif.title}</p>
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{notif.message}</p>
                              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No new notifications
                      </div>
                    )}
                  </div>
                  <div style={{
                    padding: '10px',
                    borderTop: '1px solid var(--border)',
                    textAlign: 'center'
                  }}>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export Button */}
          <button
            className="btn"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FiDownload /> Export Report
          </button>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '10px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
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
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Stats Grid */}
            <div className="metro-grid" style={{ marginBottom: '30px' }}>
              {statsCards.map((stat, index) => (
                <motion.div
                  key={index}
                  className={`metro-tile colored ${stat.color}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                        {stat.title}
                      </p>
                      <h2 style={{ fontSize: '36px', marginBottom: '4px' }}>
                        {stat.value}
                      </h2>
                      <p style={{ fontSize: '12px', opacity: 0.8 }}>
                        {stat.trend}
                      </p>
                      <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                        {stat.details}
                      </p>
                    </div>
                    <div style={{ fontSize: '48px' }}>
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '30px',
              marginBottom: '30px'
            }}>
              {/* User Growth Chart */}
              <div className="metro-tile" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="customers" stackId="1" stroke="#0078d4" fill="#0078d4" />
                    <Area type="monotone" dataKey="providers" stackId="1" stroke="#00b294" fill="#00b294" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Popular Services */}
              <div className="metro-tile" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Popular Services</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={popularServices}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={entry => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {popularServices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Second Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px'
            }}>
              {/* Revenue Trend */}
              <div className="metro-tile" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#0078d4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Peak Hours */}
              <div className="metro-tile" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Peak Hours</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#00b294" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activities */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ marginBottom: '20px' }}>Recent System Activities</h3>
              <div className="metro-tile" style={{ padding: '20px' }}>
                {recentActivities.map((activity, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '10px',
                    borderBottom: index < recentActivities.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: activity.type === 'user' ? 'var(--blue)' :
                                  activity.type === 'appointment' ? 'var(--green)' : 'var(--orange)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {activity.type === 'user' ? <FiUsers /> :
                       activity.type === 'appointment' ? <FiCalendar /> : <FiActivity />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 'bold' }}>{activity.description}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: activity.status === 'success' ? 'var(--success)' :
                                  activity.status === 'warning' ? 'var(--warning)' : 'var(--error)',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* User Management Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2>User Management</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary">
                  <FiPlus /> Add New User
                </button>
                <button className="btn btn-secondary">
                  <FiDownload /> Export
                </button>
              </div>
            </div>

            {/* Filters */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <FiSearch style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }} />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
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
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: 'white'
                }}
              >
                <option value="all">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="PROVIDER">Providers</option>
                <option value="ADMIN">Admins</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: 'white'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="metro-tile" style={{ padding: '0', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '15px', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Joined</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Last Active</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: user.role === 'CUSTOMER' ? 'var(--blue)' :
                                       user.role === 'PROVIDER' ? 'var(--green)' : 'var(--purple)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}>
                            {user.fullName?.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 'bold' }}>{user.fullName}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: user.role === 'CUSTOMER' ? 'rgba(0,120,212,0.1)' :
                                     user.role === 'PROVIDER' ? 'rgba(16,137,62,0.1)' : 'rgba(136,23,152,0.1)',
                          color: user.role === 'CUSTOMER' ? 'var(--blue)' :
                                 user.role === 'PROVIDER' ? 'var(--green)' : 'var(--purple)',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: user.isActive ? 'var(--success)' : 'var(--error)'
                        }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: user.isActive ? 'var(--success)' : 'var(--error)'
                          }} />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>
                        {new Date(user.lastActive || user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="btn btn-secondary"
                            style={{ padding: '6px' }}
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleUserAction(user._id, user.isActive ? 'suspend' : 'activate')}
                            className="btn btn-secondary"
                            style={{ 
                              padding: '6px',
                              color: user.isActive ? 'var(--error)' : 'var(--success)'
                            }}
                            title={user.isActive ? 'Suspend' : 'Activate'}
                          >
                            {user.isActive ? <FiUserX /> : <FiUserCheck />}
                          </button>
                          <button
                            onClick={() => handleUserAction(user._id, 'delete')}
                            className="btn btn-secondary"
                            style={{ padding: '6px', color: 'var(--error)' }}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '6px' }}>
                            <FiMoreVertical />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Services Management */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2>Service Management</h2>
              <button className="btn btn-primary">
                <FiPlus /> Add New Service
              </button>
            </div>

            <div className="metro-grid">
              {services.map((service, index) => (
                <motion.div
                  key={service._id}
                  className="metro-tile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div style={{ position: 'relative' }}>
                    {!service.isActive && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        background: 'var(--error)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        Inactive
                      </div>
                    )}
                    <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{service.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
                      {service.description}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                      <span style={{
                        background: 'var(--background)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {service.category}
                      </span>
                      <span style={{
                        background: 'var(--background)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {service.durationMinutes} min
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        ${service.price}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleServiceAction(service._id, 'toggle-active')}
                          className="btn btn-secondary"
                          style={{ padding: '8px' }}
                          title={service.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {service.isActive ? <FiUserX /> : <FiUserCheck />}
                        </button>
                        <button
                          onClick={() => handleServiceAction(service._id, 'delete')}
                          className="btn btn-secondary"
                          style={{ padding: '8px', color: 'var(--error)' }}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'appointments' && (
          <motion.div
            key="appointments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 style={{ marginBottom: '20px' }}>Appointment Overview</h2>
            <div className="metro-tile" style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--background)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Provider</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Service</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date & Time</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt, index) => (
                    <tr key={apt._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}>{apt.customer?.fullName}</td>
                      <td style={{ padding: '12px' }}>{apt.employee?.user?.fullName}</td>
                      <td style={{ padding: '12px' }}>{apt.service?.name}</td>
                      <td style={{ padding: '12px' }}>
                        {new Date(apt.startTime).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: apt.status === 'COMPLETED' ? 'var(--success)' :
                                     apt.status === 'CANCELLED' ? 'var(--error)' :
                                     apt.status === 'BOOKED' ? 'var(--warning)' : 'var(--primary)',
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>
                        ${apt.service?.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 style={{ marginBottom: '20px' }}>Advanced Analytics</h2>
            <div className="metro-grid">
              <div className="metro-tile" style={{ gridColumn: 'span 2', padding: '20px' }}>
                <h3>System Performance</h3>
                {/* Add more detailed analytics here */}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 style={{ marginBottom: '20px' }}>System Settings</h2>
            <div className="metro-grid">
              <div className="metro-tile">
                <h3>General Settings</h3>
                {/* Add settings form here */}
              </div>
              <div className="metro-tile">
                <h3>Email Configuration</h3>
                {/* Add email settings here */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
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
              zIndex: 2000
            }}
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="metro-tile"
              style={{ maxWidth: '500px', width: '90%', padding: '30px' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: '20px' }}>User Details</h2>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Name:</strong> {selectedUser.fullName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;